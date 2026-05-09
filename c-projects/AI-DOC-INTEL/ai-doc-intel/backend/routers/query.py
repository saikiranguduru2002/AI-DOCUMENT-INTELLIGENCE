from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from services.embeddings import similarity_search
from services.llm import answer_question
from supabase import create_client
import os

router = APIRouter()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))


class QueryRequest(BaseModel):
    document_id: str
    question: str


@router.post("/")
async def query_document(req: QueryRequest, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    user_resp = supabase.auth.get_user(token)
    user_id = user_resp.user.id

    # Verify document belongs to user
    doc = (
        supabase.table("documents")
        .select("*")
        .eq("id", req.document_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not doc.data:
        raise HTTPException(404, "Document not found")
    if doc.data["status"] != "ready":
        raise HTTPException(400, "Document is still processing")

    # Get relevant chunks
    chunks = similarity_search(req.question, req.document_id)
    if not chunks:
        return {"answer": "No relevant content found in the document.", "sources": []}

    # Generate answer
    result = answer_question(req.question, chunks)

    # Save to query history
    (
        supabase.table("queries")
        .insert(
            {
                "user_id": user_id,
                "document_id": req.document_id,
                "question": req.question,
                "answer": result["answer"],
                "sources": result["sources"],
                "confidence": result["confidence"],
            }
        )
        .execute()
    )

    return result

