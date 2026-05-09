from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from services.llm import extract_structured_data
from supabase import create_client
import os

router = APIRouter()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))


class ExtractRequest(BaseModel):
    document_id: str


@router.post("/")
async def extract_data(req: ExtractRequest, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    user_resp = supabase.auth.get_user(token)
    user_id = user_resp.user.id

    # Get all chunks for document
    chunks = (
        supabase.table("chunks")
        .select("content")
        .eq("document_id", req.document_id)
        .order("chunk_index")
        .execute()
    )

    full_content = " ".join([c["content"] for c in chunks.data])
    extracted = extract_structured_data(full_content)
    return extracted

