// import React, { useState } from 'react';
// import axios from 'axios';

import { NextApiRequest, NextApiResponse } from 'next';
import { customLog } from '@/utils/customLog';
import { AIRequest } from '@/utils/chat_gpt/ai_requset';
// import { SearchClient, AzureKeyCredential } from '@azure/search-documents';
import { SearchClient, AzureKeyCredential as SearchKeyCredential, } from '@azure/search-documents';
  
const API_KEY: string = process.env.AZURE_AI_API_KEY_CHATGPT35!;
const EMBEDDING_DEPLOYNAME: string = process.env.OPENAI_API_EMBEDDING_DEPLOYNAME!;
const OPENAI_URL: string = process.env.OPENAI_API_URL!;

const searchendpoint = process.env.SEARCH_API_ENDPOINT;
const searchapiKey = process.env.SEARCH_API_KEY;
const searchindexname = process.env.SEARCH_INDEXNAME;


export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        customLog(req.body,"DEBUG");
        const requestMessage: string = req.body.message;
    
        if(requestMessage == "") {
          customLog("requestMessage is empty","DEBUG");
          return res.status(200).json({ success: false, message: "request message is empty" });
        }
    
        const searchClient = new SearchClient(
            searchendpoint,
            searchindexname,
            new AzureKeyCredential(searchapiKey)
        );

        const [searchResults, setSearchResults] = useState<string>('');

        try {
        const embeddings = await generateEmbeddings(query);

        const response = await searchClient.search(query, {
            vectorQueries: [{
            kind: "vector",
            vector: embeddings,
            kNearestNeighborsCount: 3,
            fields: ["vector"],
            }],
            select: ["chunk", "title"],
            queryType: "semantic",
            top: 1,
            semanticSearchOptions: {
            answers: {
                answerType: "extractive",
                count: 3
            },
            captions: {
                captionType: "extractive",
                count: 3
            },
            configurationName: "vector-kitei-semantic-configuration",
            }
        });

        let message = "";
        let title = "";

        for await (const result of response.results) {
            title = result.document.title;

            if (result.captions) {
            const caption = result.captions[0];
            if (caption.highlights) {
                message += `Caption: ${caption.highlights}\n`;
            } else {
                message += `Caption: ${caption.text}\n`;  // 検索ワードに一番近い抜粋
            }
            }
        }

        if (message.trim() === '') {
            console.log('AI Search Message is empty');
        } else {
            message = message + "\n" + title;
            setSearchResults(message);
        }
        } catch (error) {
        console.error('Error during semantic search:', error);
        }

        const generateEmbeddings = async (text) => {
            const apiVersion = "2023-09-01-preview";

            try {
            const response = await axios.post(
                `${OPENAI_URL}${EMBEDDING_DEPLOYNAME}/embeddings?api-version=${apiVersion}`,
                {
                input: text,
                engine: "text-embedding-ada-002",
                },
                {
                headers: {
                    "Content-Type": "application/json",
                    "api-key": API_KEY,
                },
                }
            );
            const embeddings = response.data.data[0].embedding;
            return embeddings;
            } catch (error) {
            console.error('Error during embeddings generation:', error);
            throw error;
            }
        };
    }
};






// function SemanticSearchComponent({ }) {
//   const searchClient = new SearchClient(
//       searchendpoint,
//       searchindexname,
//       new AzureKeyCredential(searchapiKey)
//   );

//   const [searchResults, setSearchResults] = useState<string>('');

//   const doSemanticHybridSearch = async (query) => {
//     try {
//       const embeddings = await generateEmbeddings(query);

//       const response = await searchClient.search(query, {
//         vectorQueries: [{
//           kind: "vector",
//           vector: embeddings,
//           kNearestNeighborsCount: 3,
//           fields: ["vector"],
//         }],
//         select: ["chunk", "title"],
//         queryType: "semantic",
//         top: 1,
//         semanticSearchOptions: {
//           answers: {
//             answerType: "extractive",
//             count: 3
//           },
//           captions: {
//             captionType: "extractive",
//             count: 3
//           },
//           configurationName: "vector-kitei-semantic-configuration",
//         }
//       });

//       let message = "";
//       let title = "";

//       for await (const result of response.results) {
//         title = result.document.title;

//         if (result.captions) {
//           const caption = result.captions[0];
//           if (caption.highlights) {
//             message += `Caption: ${caption.highlights}\n`;
//           } else {
//             message += `Caption: ${caption.text}\n`;  // 検索ワードに一番近い抜粋
//           }
//         }
//       }

//       if (message.trim() === '') {
//         console.log('AI Search Message is empty');
//       } else {
//         message = message + "\n" + title;
//         setSearchResults(message);
//       }
//     } catch (error) {
//       console.error('Error during semantic search:', error);
//     }
//   };

//   const generateEmbeddings = async (text) => {
//     const apiVersion = "2023-09-01-preview";

//     try {
//       const response = await axios.post(
//         `${OPENAI_URL}${EMBEDDING_DEPLOYNAME}/embeddings?api-version=${apiVersion}`,
//         {
//           input: text,
//           engine: "text-embedding-ada-002",
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//             "api-key": API_KEY,
//           },
//         }
//       );
//       const embeddings = response.data.data[0].embedding;
//       return embeddings;
//     } catch (error) {
//       console.error('Error during embeddings generation:', error);
//       throw error;
//     }
//   };

// }

// export default SemanticSearchComponent;
