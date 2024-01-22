import fetch from 'node-fetch';
import { NextApiRequest, NextApiResponse } from 'next';
import { customLog } from '@/utils/customLog';
import { AIRequest } from '@/utils/chat_gpt/ai_requset';

// const apiKey: string = 'YOUR_AZURE_API_KEY';
// const endpoint: string = 'YOUR_AZURE_QUESTION_ANSWERING_ENDPOINT';

const API_KEY: string = process.env.AZURE_API_KEY_QUESTION_ANSWERING!;
const ENDPOINT: string = process.env.AZURE_ENDPOINT_QUESTION_ANSWERING!;

interface RequestBody {
    question: string;
    context: string;
}

const requestBody: RequestBody = {
    question: 'Your question goes here',
    context: 'Context for the question goes here',
};

const requestOptions: RequestInit & { body: string } = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `EndpointKey ${API_KEY}`,
    },
    body: JSON.stringify(requestBody),
};

fetch(ENDPOINT, requestOptions)
    .then(response => response.json())
    .then(data => {
        console.log('Answer:', data.answers);
    })
    .catch(error => {
        console.error('Error:', error);
    });


export default async (req: NextApiRequest, res: NextApiResponse) => {
if (req.method === 'POST') {
    customLog(req.body,"DEBUG");
    const requestMessage: string = req.body.message;
    // const systemMessage: string = req.body.summarySystemMessage;
    // req.body.summarySystemMessageが存在すればその値を、存在しなければデフォルト値を使用
    const systemMessage: string = req.body.summarySystemMessage || "システムメッセージ";
    
    if(requestMessage == "") {
    customLog("requestMessage is empty","DEBUG");
    return res.status(200).json({ success: false, message: "request message is empty" });
    }

    // OpenAIのレスポンスのJSON型,適切な型リストが見つかり次第実装予定
    let data: any;
    const headers = new Headers();
    headers.append("api-key", API_KEY);
    headers.append("Content-Type", "application/json");
    const ai_request = new AIRequest();
    ai_request.model = "gpt-3.5-turbo";
    ai_request.messages = [
    // { role: "system", content: "システムメッセージ" },
    { role: "system", content: systemMessage },
    { role: "user", content: requestMessage }
    //{ role: "assistant", content: "システムメッセージ" },
    //{ role: "user", content: "システムメッセージ" },
    ];

    const body = ai_request.toJSON();
    customLog(body,"DEBUG");

    let requestOptions = {
    method: "POST",
    headers: headers,
    body: body
    };

    let response: any = undefined;
    try {
    response = await fetch(AZURE_AI_SERVER_URL, requestOptions);
    }catch(e){
    console.log("Error : getCustomMessageFromChatGPT.ts is bad function");
    console.log(e);
    }
    let responseMessage: string = "";
    if (response.ok) {
    data = await response.json();
    responseMessage = data.choices[0].message.content;
    if(responseMessage != ""){
        customLog(data.choices[0].message,"DEBUG");
        return res.status(200).json({ success: true, message: responseMessage });
    } else {
        customLog('response message is empty',"FUNCTION");
    }
    } else {
    customLog('Network response was not ok',"FUNCTION");
    }
    return res.status(200).json({ success: false, message: "API response was not ok" });
}
};

