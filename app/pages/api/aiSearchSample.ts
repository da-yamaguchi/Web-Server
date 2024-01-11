import axios from 'axios';
import { WebClient } from '@slack/web-api';
import {
  SearchClient,
  AzureKeyCredential as SearchKeyCredential,
} from '@azure/search-documents';
import {
  OpenAIClient,
  AzureKeyCredential as OpenAIKeyCredential,
} from '@azure/openai';
import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from 'openai';

const openaiClient = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
    basePath: process.env.OPENAI_API_URL + process.env.OPENAI_API_MODEL,
    baseOptions: {
      headers: { 'api-key': process.env.OPENAI_API_KEY },
      params: {
        'api-version': '2023-09-01-preview',
      },
    },
  })
);

const searchendpoint = process.env.SEARCH_API_ENDPOINT;
const apiKey = process.env.SEARCH_API_KEY;

const searchClient = new SearchClient(
  process.env.SEARCH_API_ENDPOINT,
  process.env.SEARCH_INDEXNAME,
  new SearchKeyCredential(process.env.SEARCH_API_KEY)
);

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);
const GPT_BOT_USER_ID = process.env.GPT_BOT_USER_ID;
const GPT_THREAD_MAX_COUNT = process.env.GPT_THREAD_MAX_COUNT;
const CHAT_GPT_SYSTEM_PROMPT = process.env.CHAT_GPT_SYSTEM_PROMPT;
const CHAT_GPT_SYSTEM_PROMPT_NO_SEARCHRESULT =
  process.env.CHAT_GPT_SYSTEM_PROMPT_NO_SEARCHRESULT;

const postMessage = async (
  channel: string,
  text: string,
  threadTs: string,
  context: any
) => {
  await slackClient.chat.postMessage({
    channel: channel,
    text: text,
    thread_ts: threadTs,
  });
  context.log(text);
};

const createCompletion = async (
  messages: any[],
  context: any
): Promise<string> => {
  try {
    const chatOptions = {
      messages: messages,
      max_tokens: 10000,
      temperature: 0.7,
      frequency_penalty: 0,
      presence_penalty: 0,
      top_p: 0.95,
    };
    context.log(chatOptions);

    const response = await openaiClient.createChatCompletion(chatOptions);
    return response.data.choices[0].message.content;
  } catch (err) {
    context.log.error(err);
    return err.response.statusText;
  }
};

async function doSemanticHybridSearch(
  searchClient: SearchClient,
  query: string,
  context: any
): Promise<string> {
  const response = await searchClient.search(query, {
    vectorQueries: [
      {
        kind: 'vector',
        vector: await generateEmbeddings(query),
        kNearestNeighborsCount: 3,
        fields: ['vector'],
      },
    ],
    select: ['chunk', 'title'],
    queryType: 'semantic',
    top: 1,
    semanticSearchOptions: {
      answers: {
        answerType: 'extractive',
        count: 3,
      },
      captions: {
        captionType: 'extractive',
        count: 3,
      },
      configurationName: 'vector-kitei-semantic-configuration',
    },
  });
  context.log(`\nSemantic Hybrid search results:`);

  let message = '';
  let title = '';

  for await (const result of response.results) {
    context.log(`Title: ${result.document.title}`);
    title = result.document.title;
    context.log(`Reranker Score: ${result.rerankerScore}`); // Reranker score is the semantic score

    if (result.captions) {
      const caption = result.captions[0];
      if (caption.highlights) {
        context.log(`Caption: ${caption.highlights}`);
      } else {
        context.log(`Caption: ${caption.text}`); // 検索ワードに一番近い抜粋
        message = caption.text;
      }
    }
    context.log(`\n`);
  }

  if (message.trim() === '') {
    console.log('AI Search Message is empty');
  } else {
    message = message + '\n' + title;
  }
  return message;
}

async function generateEmbeddings(text: string): Promise<string> {
  const apiVersion = '2023-09-01-preview';

  const response = await axios.post(
    `${process.env.OPENAI_API_URL}${process.env.OPENAI_API_EMBEDDING_DEPLOYNAME}/embeddings?api-version=${apiVersion}`,
    {
      input: text,
      engine: 'text-embedding-ada-002',
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.OPENAI_API_KEY,
      },
    }
  );
  const embeddings = response.data.data[0].embedding;
  return embeddings;
}

export default async function (
  context: any,
  req: { headers: any; body: any }
): Promise<any> {
  context.log('JavaScript HTTP trigger function processed a request.');

  if (!searchendpoint || !apiKey) {
    context.log(
      'Make sure to set valid values for endpoint and apiKey with proper authorization.'
    );
    return;
  }

  if (req.headers['x-slack-retry-num']) {
    context.log(
      'Ignoring Retry request: ' + req.headers['x-slack-retry-num']
    );
    context.log(req.body);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'No need to resend' }),
    };
  }

  // Response slack challenge requests
  const body = eval(req.body);
  context.log('body.challenge');
  if (body.challenge) {
    context.log('Challenge: ' + body.challenge);
    context.res = {
      body: body.challenge,
    };
    return;
  }

  context.log(req.body);
  const event = body.event;
  const threadTs = event?.thread_ts ?? event?.ts;

  if (event?.type === 'app_mention') {
    try {
      const threadMessagesResponse = await slackClient.conversations.replies({
        channel: event.channel,
        ts: threadTs,
      });

      if (threadMessagesResponse.ok !== true) {
        await postMessage(
          event.channel,
          '[Bot]メッセージの取得に失敗しました。',
          threadTs,
          context
        );
        return;
      }

      var botMessages = threadMessagesResponse.messages
        .sort((a, b) => Number(a.ts) - Number(b.ts))
        .filter(
          (message) =>
            message.text.includes(GPT_BOT_USER_ID) ||
            message.user == GPT_BOT_USER_ID
        )
        .slice(GPT_THREAD_MAX_COUNT * -1)
        .map((m) => {
          const role = m.bot_id
            ? ChatCompletionRequestMessageRoleEnum.Assistant
           
