import io
from pypdf import PdfReader
from docx import Document
from typing import List, Dict


def parse_pdf(file_bytes: bytes) -> List[Dict]:
    """Returns list of {page_number, content}"""
    reader = PdfReader(io.BytesIO(file_bytes))
    pages = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        if text and text.strip():
            pages.append({"page_number": i + 1, "content": text.strip()})
    return pages


def parse_docx(file_bytes: bytes) -> List[Dict]:
    """Returns list of {page_number, content} — docx has no pages, uses sections"""
    doc = Document(io.BytesIO(file_bytes))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    # Group into fake pages of ~500 words each
    pages = []
    current_page = []
    word_count = 0
    page_num = 1
    for para in paragraphs:
        words = len(para.split())
        current_page.append(para)
        word_count += words
        if word_count >= 500:
            pages.append({"page_number": page_num, "content": "\n".join(current_page)})
            current_page = []
            word_count = 0
            page_num += 1
    if current_page:
        pages.append({"page_number": page_num, "content": "\n".join(current_page)})
    return pages


def chunk_text(
    pages: List[Dict], chunk_size: int = 500, overlap: int = 50
) -> List[Dict]:
    """Split pages into overlapping chunks for embedding"""
    chunks = []
    chunk_index = 0
    for page in pages:
        words = page["content"].split()
        for i in range(0, len(words), chunk_size - overlap):
            chunk_words = words[i : i + chunk_size]
            if len(chunk_words) < 20:  # skip tiny chunks
                continue
            chunks.append(
                {
                    "content": " ".join(chunk_words),
                    "page_number": page["page_number"],
                    "chunk_index": chunk_index,
                }
            )
            chunk_index += 1
    return chunks

