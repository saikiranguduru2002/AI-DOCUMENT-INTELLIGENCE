from fastapi import APIRouter, UploadFile, File, HTTPException, Header
from services.parser import parse_pdf, parse_docx, chunk_text
from services.embeddings import store_chunks
from supabase import create_client
import os, uuid

router = APIRouter()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))


@router.post("/")
async def upload_document(file: UploadFile = File(...), authorization: str = Header(...)):
    # Validate file type
    if not file.filename.endswith((".pdf", ".docx")):
        raise HTTPException(400, "Only PDF and DOCX files are supported")

    # Validate file size
    contents = await file.read()
    max_size = int(os.getenv("MAX_FILE_SIZE_MB", 10)) * 1024 * 1024
    if len(contents) > max_size:
        raise HTTPException(
            400, f"File too large. Max size: {os.getenv('MAX_FILE_SIZE_MB')}MB"
        )

    # Get user from token
    token = authorization.replace("Bearer ", "")
    user_resp = supabase.auth.get_user(token)
    user_id = user_resp.user.id

    # Upload to Supabase Storage
    file_path = f"{user_id}/{uuid.uuid4()}/{file.filename}"
    supabase.storage.from_("documents").upload(file_path, contents)
    file_url = supabase.storage.from_("documents").get_public_url(file_path)

    # Create document record
    doc_type = "pdf" if file.filename.endswith(".pdf") else "docx"
    doc = (
        supabase.table("documents")
        .insert(
            {
                "user_id": user_id,
                "filename": file.filename,
                "file_url": file_url,
                "file_type": doc_type,
                "status": "processing",
            }
        )
        .execute()
    )
    document_id = doc.data[0]["id"]

    # Parse + chunk + embed (in background ideally, but sync for MVP)
    try:
        if doc_type == "pdf":
            pages = parse_pdf(contents)
        else:
            pages = parse_docx(contents)

        chunks = chunk_text(pages)
        store_chunks(document_id, chunks)

        (
            supabase.table("documents")
            .update(
                {
                    "status": "ready",
                    "page_count": max(p["page_number"] for p in pages) if pages else 0,
                }
            )
            .eq("id", document_id)
            .execute()
        )

    except Exception as e:
        supabase.table("documents").update({"status": "error"}).eq(
            "id", document_id
        ).execute()
        raise HTTPException(500, f"Processing failed: {str(e)}")

    return {"document_id": document_id, "filename": file.filename, "status": "ready"}

