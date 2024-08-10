const { Pinecone } = require('@pinecone-database/pinecone');

async function runPineconeOperations() {
  try {
    // Initialize the Pinecone client
    const pc = new Pinecone({
      apiKey: 'd678b2eb-eff8-4cb4-a899-20a6be0ec0c1',
    });

    // Select the index
    const index = pc.index('quickstart');

    // Upsert vectors into the namespace
    await index.namespace('ns1').upsert([
      {
        id: 'vec1',
        values: [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
        metadata: { genre: 'drama' }
      },
      {
        id: 'vec2',
        values: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2],
        metadata: { genre: 'action' }
      },
      {
        id: 'vec3',
        values: [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3],
        metadata: { genre: 'drama' }
      },
      {
        id: 'vec4',
        values: [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4],
        metadata: { genre: 'action' }
      }
    ]);

    // Query the namespace
    const result = await index.namespace('ns1').query({
      topK: 2,
      vector: [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3],
      includeValues: true,
      includeMetadata: true,
      filter: { genre: { '$eq': 'action' } }
    });

    // Log the result
    console.log('Query Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error during Pinecone operations:', error);
  }
}

// Execute the function
runPineconeOperations();
