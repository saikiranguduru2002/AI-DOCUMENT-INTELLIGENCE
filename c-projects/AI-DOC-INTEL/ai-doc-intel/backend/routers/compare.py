from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from services.llm import compare_documents
from supabase import create_client
import os

router = APIRouter()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))


class CompareRequest(BaseModel):
    document_id_a: str
    document_id_b: str


@router.post("/")
async def compare_docs(req: CompareRequest, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    user_resp = supabase.auth.get_user(token)
    user_id = user_resp.user.id

    def get_content(doc_id: str) -> tuple:
        doc = (
            supabase.table("documents")
            .select("filename")
            .eq("id", doc_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        if not doc.data:
            raise HTTPException(404, f"Document {doc_id} not found")
        chunks = (
            supabase.table("chunks")
            .select("content")
            .eq("document_id", doc_id)
            .order("chunk_index")
            .execute()
        )
        content = " ".join([c["content"] for c in chunks.data])
        return content, doc.data["filename"]

    content_a, name_a = get_content(req.document_id_a)
    content_b, name_b = get_content(req.document_id_b)
    return compare_documents(content_a, content_b, name_a, name_b)

