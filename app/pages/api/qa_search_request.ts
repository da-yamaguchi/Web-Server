const axios = require('axios');

async function sendRequest() {
  const apiUrl = 'https://link-tech-faq.cognitiveservices.azure.com/language/:query-knowledgebases?api-version=2021-10-01&deploymentName=production&projectName=link-tech-question-answering';
  //ENDPOINT、projectName

  const headers = {
    // 'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IjVCM25SeHRRN2ppOGVORGMzRnkwNUtmOTdaRSIsImtpZCI6IjVCM25SeHRRN2ppOGVORGMzRnkwNUtmOTdaRSJ9.eyJhdWQiOiJodHRwczovL21hbmFnZW1lbnQuY29yZS53aW5kb3dzLm5ldCIsImlzcyI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0LzNiZjc2OWVmLTFmM2ItNDhhZi1iMzIyLWQyMjUwMGQyMmMyZi8iLCJpYXQiOjE3MDU5MTIzMzAsIm5iZiI6MTcwNTkxMjMzMCwiZXhwIjoxNzA1OTE3NzUwLCJhY3IiOiIxIiwiYWlvIjoiQVRRQXkvOFZBQUFBUGlmaHJJcGFuR0pUdmliQ2UzaTcwcGtRVWppRzBoZ3BldC9vb3R6WlhtaTNTK1NTUEh3czQzRWtHQzJLYUpxVSIsImFtciI6WyJwd2QiXSwiYXBwaWQiOiIxOGZiY2ExNi0yMjI0LTQ1ZjYtODViMC1mN2JmMmIzOWIzZjMiLCJhcHBpZGFjciI6IjAiLCJmYW1pbHlfbmFtZSI6IuWxseWPoyIsImdpdmVuX25hbWUiOiLlpKfovJQiLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiIyNDAwOjQxN2E6MzA2ODpjNDAwOmM4NWE6MWZjYjo1YzhjOjVmYzUiLCJuYW1lIjoi5bGx5Y-jIOWkp-i8lCIsIm9pZCI6ImRiZTk4ZmJkLWRlOGUtNDgwMS05NDBmLWI3N2JhYzMxNTRkNyIsInB1aWQiOiIxMDAzMjAwMDREMUJDNDc5IiwicmgiOiIwLkFTb0E3Mm4zT3pzZnIwaXpJdElsQU5Jc0wwWklmM2tBdXRkUHVrUGF3ZmoyTUJNcUFHRS4iLCJzY3AiOiJ1c2VyX2ltcGVyc29uYXRpb24iLCJzdWIiOiJTTGp2WUdVY1dYNXQ3a2JPcER0dXpMTndnTGZKZGNMb19PZ0Q0cWEwa0NJIiwidGlkIjoiM2JmNzY5ZWYtMWYzYi00OGFmLWIzMjItZDIyNTAwZDIyYzJmIiwidW5pcXVlX25hbWUiOiJkLXlhbWFndWNoaUBsaW5rLXRlY2guanAiLCJ1cG4iOiJkLXlhbWFndWNoaUBsaW5rLXRlY2guanAiLCJ1dGkiOiJmYUNiQ2UtU2prdWZjTWNiS2xZekFBIiwidmVyIjoiMS4wIiwid2lkcyI6WyJiNzlmYmY0ZC0zZWY5LTQ2ODktODE0My03NmIxOTRlODU1MDkiXSwieG1zX2NhZSI6IjEiLCJ4bXNfdGNkdCI6MTU1MjczOTIzOH0.c8eOORJlsVg55ekTu7jX43Kofkhj1emeoD1kDu9xYk4hTlKJuMvDy2_VUiZqUTDj3ksNW15FZhd12BOAV2n1AUbET4Lh1AlqPz822ukgYAHNBWfE7H-ntH5s_J-p47bW2VzL3uIG2siWgVSnH7Bys7iHf8AG1HUb9TI9UckPaY-rZrYhjU66vG9dsxvU30Ll-4AZ39XK4A__e3fFUNpNX2cxeUcvBC_j3YWWYxMEpC5S8Dja0EFr2Xna0BDnzKWSjNOvmJkbC6AuXj9e8tGAQ4C0M7xcBywMD541e6JmZaWDIn_9N9JNsqemD7dSe-J8BukBc7-Q3p6t7om8TqpHsA',
    'Content-type': 'application/json',
    'Ocp-apim-subscription-key': 'APIキー',
  };



  const requestBody = {
    question: '健康診断について',
    top: 3,
    // userId: 'sd53lsY=',
    confidenceScoreThreshold: 0.2,
    // context: {
    //   previousQnaId: 9,
    //   previousUserQuery: 'Where are QnA Maker quickstarts?',
    // },
    rankerType: 'Default',
    // filters: {
    //   metadataFilter: {
    //     metadata: [
    //       { key: 'category', value: 'api' },
    //       { key: 'editorial', value: 'chitchat' },
    //     ],
    //     logicalOperation: 'AND',
    //   },
    //   sourceFilter: ['filename1.pdf', 'https://www.wikipedia.org/microsoft'],
    //   logicalOperation: 'AND',
    // },
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

  try {
    const response = await axios(config);
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// 関数呼び出し
sendRequest();
