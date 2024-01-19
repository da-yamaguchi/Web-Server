import fetch from 'node-fetch';

const apiKey: string = 'YOUR_AZURE_API_KEY';
const endpoint: string = 'YOUR_AZURE_QUESTION_ANSWERING_ENDPOINT';

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
        'Authorization': `EndpointKey ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
};

fetch(endpoint, requestOptions)
    .then(response => response.json())
    .then(data => {
        console.log('Answer:', data.answers);
    })
    .catch(error => {
        console.error('Error:', error);
    });
