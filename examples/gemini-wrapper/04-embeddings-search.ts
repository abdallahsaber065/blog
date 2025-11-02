/**
 * Embeddings and Semantic Search Examples
 * Demonstrates vector embeddings and similarity search
 */

import { GeminiWrapper } from '@/lib/gemini-wrapper';

async function main() {
  const gemini = new GeminiWrapper({
    apiKey: process.env.GEMINI_API_KEY!
  });

  console.log('=== Basic Embeddings ===\n');

  // Generate embedding for a query
  const queryEmbedding = await gemini.embeddings.embedQuery(
    "best practices for React hooks"
  );
  console.log('Query embedding dimensions:', queryEmbedding.embedding.values.length);
  console.log('First few values:', queryEmbedding.embedding.values.slice(0, 5));
  console.log();

  console.log('=== Document Embeddings ===\n');

  // Documents to embed
  const documents = [
    "React hooks allow you to use state in functional components",
    "TypeScript provides type safety for JavaScript applications",
    "Python is great for data science and machine learning",
    "useState is the most commonly used React hook",
    "Docker containers help with application deployment"
  ];

  // Embed all documents
  const docEmbeddings = await gemini.embeddings.embedBatch(
    documents,
    "RETRIEVAL_DOCUMENT"
  );

  console.log(`Embedded ${docEmbeddings.length} documents`);
  console.log();

  console.log('=== Semantic Search ===\n');

  // Search query
  const searchQuery = "How do I use React hooks?";
  const searchEmbedding = await gemini.embeddings.embedQuery(searchQuery);

  // Find similar documents
  const results = gemini.embeddings.findSimilar(
    searchEmbedding.embedding.values,
    docEmbeddings.map(e => e.embedding.values),
    3  // Top 3 results
  );

  console.log(`Search query: "${searchQuery}"\n`);
  console.log('Most similar documents:');
  for (const result of results) {
    console.log(`\nDocument #${result.index + 1} (similarity: ${result.similarity.toFixed(4)})`);
    console.log(`"${documents[result.index]}"`);
  }
  console.log();

  console.log('=== Similarity Comparison ===\n');

  // Compare two specific texts
  const text1 = "Machine learning is a subset of artificial intelligence";
  const text2 = "AI includes machine learning and deep learning";
  const text3 = "The weather is nice today";

  const embed1 = await gemini.embeddings.embed({ content: text1 });
  const embed2 = await gemini.embeddings.embed({ content: text2 });
  const embed3 = await gemini.embeddings.embed({ content: text3 });

  const similarity12 = gemini.embeddings.cosineSimilarity(
    embed1.embedding.values,
    embed2.embedding.values
  );

  const similarity13 = gemini.embeddings.cosineSimilarity(
    embed1.embedding.values,
    embed3.embedding.values
  );

  console.log('Text 1:', text1);
  console.log('Text 2:', text2);
  console.log('Similarity:', similarity12.toFixed(4), '\n');

  console.log('Text 1:', text1);
  console.log('Text 3:', text3);
  console.log('Similarity:', similarity13.toFixed(4), '\n');

  console.log('=== Using Different Task Types ===\n');

  // Different task types
  const classificationEmbed = await gemini.embeddings.embed({
    content: "This is a great product!",
    taskType: "CLASSIFICATION"
  });

  const clusteringEmbed = await gemini.embeddings.embed({
    content: "Group similar items together",
    taskType: "CLUSTERING"
  });

  console.log('Classification embedding created');
  console.log('Clustering embedding created');
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export default main;
