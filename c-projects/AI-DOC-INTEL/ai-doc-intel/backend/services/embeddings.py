from supabase import create_client
import os
from typing import List, Dict

from services.openai_client import (
    default_embedding_model,
    get_openai_client,
)

openai_client = get_openai_client()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))


def embed_text(text: str) -> List[float]:
    """Get embedding vector for a text string"""
    response = openai_client.embeddings.create(
        model=default_embedding_model(),
        input=text,
    )
    return response.data[0].embedding


def store_chunks(document_id: str, chunks: List[Dict]) -> None:
    """Embed all chunks and store in Supabase pgvector"""
    for chunk in chunks:
        embedding = embed_text(chunk["content"])
        supabase.table("chunks").insert(
            {
                "document_id": document_id,
                "content": chunk["content"],
                "chunk_index": chunk["chunk_index"],
                "page_number": chunk["page_number"],
                "embedding": embedding,
            }
        ).execute()


def similarity_search(query: str, document_id: str, top_k: int = 5) -> List[Dict]:
    """Find most relevant chunks for a query using cosine similarity"""
    query_embedding = embed_text(query)
    # Use Supabase RPC for vector similarity search
    result = supabase.rpc(
        "match_chunks",
        {
            "query_embedding": query_embedding,
            "match_document_id": document_id,
            "match_count": top_k,
        },
    ).execute()
    return result.data

