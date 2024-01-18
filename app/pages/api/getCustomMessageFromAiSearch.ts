import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { customLog } from '@/utils/customLog';
import { AIRequest } from '@/utils/chat_gpt/ai_requset';
import { SearchClient, AzureKeyCredential as SearchKeyCredential, SearchDocumentsResult } from '@azure/search-documents';
  
const API_KEY: string = process.env.AZURE_AI_API_KEY_CHATGPT35!;
const EMBEDDING_DEPLOYNAME: string = process.env.OPENAI_API_EMBEDDING_DEPLOYNAME!;
const OPENAI_URL: string = process.env.OPENAI_API_URL!;

const searchendpoint: string = process.env.SEARCH_API_ENDPOINT!;
const searchapiKey: string = process.env.SEARCH_API_KEY!;
const searchindexname: string = process.env.SEARCH_INDEXNAME!;
const searchconfigurationname: string = process.env.SEARCH_CONFIGURATION_NAME!;

const searchClient = new SearchClient(
    searchendpoint,
    searchindexname,
    new SearchKeyCredential(searchapiKey)
);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    customLog(req.body,"DEBUG");
    const requestMessage: string = req.body.message;
    customLog(requestMessage,"DEBUG");

    if(requestMessage == "") {
      customLog("requestMessage is empty","DEBUG");
      return res.status(200).json({ success: false, message: "request message is empty" });
    }

    // generateEmbeddings呼び出し時に型変換する
    const vector: number[] = await generateEmbeddings(requestMessage) as number[];
    
    const response = await searchClient.search(requestMessage, {
      vectorSearchOptions: {
        queries:  [{
          kind: 'vector',
          vector: vector,
          kNearestNeighborsCount: 3,
          fields: ['vector'],
        },
      ],
      },
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
          //count: 3,
        },
        //configurationName: 'vector-kitei-semantic-configuration',
        configurationName: searchconfigurationname,
      },
    });
          
    customLog("Semantic Hybrid search results:","DEBUG");
  
    let message = '';
    let title = '';

    for await (const result of response.results) {
      //customLog(result,"DEBUG");
      customLog("Title:" + (result.document as any).title,"DEBUG");
      title = (result.document as any).title;
      customLog("score:" + result.score,"DEBUG");
      customLog("Reranker Score:" + result.rerankerScore,"DEBUG");
  
      if (result.captions) {
        const caption = result.captions[0];
        customLog("Caption text:" + caption.text,"DEBUG");
        if (result.rerankerScore && result.rerankerScore >= 1.35) {
          message = caption.text ?? '';
        } else {
          customLog("Reranker Scoreが1.35未満のため、検索結果無しとして動作:","DEBUG");
        }
        //message = caption.text;
        // if (caption.highlights) {
        //   customLog("Caption highlights:" + result.highlights,"DEBUG");
        // } else {
        //   customLog("Caption text:" + caption.text,"DEBUG");
        //   if (result.rerankerScore && result.rerankerScore >= 1.35) {
        //     message = caption.text ?? '';
        //   } else {
        //     customLog("Reranker Scoreが1.35未満のため、検索結果無しとして動作:","DEBUG");
        //   }
        //   //message = caption.text;
        // }
      } else {
        customLog("No result.captions","DEBUG");
      }
    }
  
    if (message.trim() === '') {
      customLog("AI Search Message is empty","DEBUG");
    } else {
      message = message + '\n' + title;
      customLog("Return Message:" + message,"DEBUG");
      return res.status(200).json({ success: true, message: message });
    }
    return res.status(200).json({ success: false, message: "提供されているドキュメントに合致する検索結果はありません。" });
  }
};

async function generateEmbeddings(text: string): Promise<unknown> {
  const apiVersion = '2023-09-01-preview';

  const response = await axios.post(
    `${OPENAI_URL}${EMBEDDING_DEPLOYNAME}/embeddings?api-version=${apiVersion}`,
    {
      input: text,
      engine: 'text-embedding-ada-002',
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_KEY,
      },
    }
  );
  const embeddings = response.data.data[0].embedding;
  //customLog("embeddings:" + embeddings,"DEBUG");
  return embeddings;
}