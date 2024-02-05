import fetch from 'node-fetch';
import { NextApiRequest, NextApiResponse } from 'next';
import { customLog } from '@/utils/customLog';
const axios = require('axios');

const ENDPOINT: string = process.env.AZURE_QUESTIONANSWERING_ENDPOINT!;
const KEY: string = process.env.AZURE_QUESTIONANSWERING_KEY!;
// const PROJECT: string = process.env.AZURE_QUESTIONANSWERING_PROJECT!;

export default async (req: NextApiRequest, res: NextApiResponse) => {
if (req.method === 'POST') {
    customLog(req.body,"DEBUG");
    const requestMessage: string = req.body.message;
    
    if(requestMessage == "") {
    customLog("requestMessage is empty","DEBUG");
    return res.status(200).json({ success: false, message: "request message is empty" });
    }

    const PROJECT: string = req.body.project === "recruitment"
    ? process.env.AZURE_QUESTIONANSWERING_RECRUITMENT_INFO || "デフォルトの値"
    : process.env.AZURE_QUESTIONANSWERING_PROJECT || "デフォルトの値";

    const apiUrl = `${ENDPOINT}language/:query-knowledgebases?api-version=2021-10-01&deploymentName=production&projectName=${PROJECT}`;

    const headers = {
        'Content-type': 'application/json',
        'Ocp-apim-subscription-key': KEY,
      };
    
    const requestBody = {
        question: requestMessage,
        top: 3,
        confidenceScoreThreshold: 0.2,
        rankerType: 'Default',
        answerSpanRequest: {
          enable: true,
          confidenceScoreThreshold: 0.2,
          topAnswersWithSpan: 1,
        },
        includeUnstructuredSources: true,
      };
    
    const config = {
        method: 'POST',
        url: apiUrl,
        headers: headers,
        data: requestBody,
    };
    
    let answer = '';
    try {
        const response = await axios(config);
        console.log('Response:', response.data);
        if (response.data.answers && response.data.answers.length > 0) {
          // `answers` プロパティが存在し、かつ配列が空でない場合
          answer = response.data.answers[0].answer;
          console.log('Answer:', answer);
        } else {
          // `answers` プロパティが存在しないか、配列が空の場合
          console.log('No answers found.');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
        
    if (answer.trim() === '') {
        customLog("AI Search Message is empty","DEBUG");
      } else {
        customLog("Return answer:" + answer,"DEBUG");
        return res.status(200).json({ success: true, message: answer });
      }
      return res.status(200).json({ success: false, message: "API response was not ok" });
}
};

