import os
from pinecone import Pinecone
import torch
from transformers import AutoTokenizer, AutoModel
import numpy as np

# Initialize Pinecone
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

# Load the multilingual-e5-large model and tokenizer from Hugging Face
model_name = "intfloat/multilingual-e5-large"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)

# Set the Pinecone index
index_name = "crescent-chatbot"
index = pc.Index(index_name)

# Load the document
with open("crescent_technology_doc.txt", "r") as file:
    document = file.read()

# Split the document into smaller chunks if needed (e.g., paragraphs or sentences)
chunks = document.split("\n")
chunks = [chunk for chunk in chunks if chunk.strip()]  # Remove empty lines

def embed_text(text):
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True)
    with torch.no_grad():
        embeddings = model(**inputs).last_hidden_state.mean(dim=1)
    return embeddings.cpu().numpy()

# Embed all chunks
embeddings = []
for chunk in chunks:
    embedding = embed_text(chunk)
    embeddings.append((chunk, embedding))

# Prepare data to upsert into Pinecone
vectors = []
for i, (text, embedding) in enumerate(embeddings):
    vectors.append({
        "id": f"vec_{i}",
        "values": embedding.flatten().tolist(),
        "metadata": {"text": text}
    })

# Upsert vectors into Pinecone
index.upsert(vectors)

query_text = "What is Crescent Technology?"
query_embedding = embed_text(query_text).flatten()

# Print out the embedding to inspect
print("Query Embedding Values:")
print(query_embedding)

# Check for invalid values
if not np.isfinite(query_embedding).all():
    print("Query embedding contains invalid values.")
    query_embedding = np.nan_to_num(query_embedding)  # Replace NaN and inf with 0

# Ensure the query embedding has the correct dimension
print(f"Query embedding dimension: {len(query_embedding)}")
if len(query_embedding) != 1024:
    print("Dimension mismatch! Adjusting the embedding.")

# Query the Pinecone index
query_results = index.query(vector=[query_embedding.tolist()], top_k=5, namespace="( Default )")

print("Query Results:", query_results)
