import React, { useState } from 'react';
import axios from 'axios';

// ページコンポーネント
function SemanticSearchComponent({ searchClient }) {
  const [searchResults, setSearchResults] = useState<string>('');

  const doSemanticHybridSearch = async (query) => {
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
  };

  const generateEmbeddings = async (text) => {
    const apiVersion = "2023-09-01-preview";

    try {
      const response = await axios.post(
        `${process.env.OPENAI_API_URL}${process.env.OPENAI_API_EMBEDDING_DEPLOYNAME}/embeddings?api-version=${apiVersion}`,
        {
          input: text,
          engine: "text-embedding-ada-002",
        },
        {
          headers: {
            "Content-Type": "application/json",
            "api-key": process.env.OPENAI_API_KEY,
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

  // レンダリング
  return (
    <div>
      <h1>Semantic Search Component</h1>
      <button onClick={() => doSemanticHybridSearch("your_query_here")}>
        Perform Semantic Search
      </button>
      <div>
        <p>Search Results:</p>
        <pre>{searchResults}</pre>
      </div>
    </div>
  );
}

export default SemanticSearchComponent;
