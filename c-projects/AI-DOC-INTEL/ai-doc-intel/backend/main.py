from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import upload, query, extract, compare

app = FastAPI(title="AI Document Intelligence API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-vercel-url.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api/upload", tags=["upload"])
app.include_router(query.router, prefix="/api/query", tags=["query"])
app.include_router(extract.router, prefix="/api/extract", tags=["extract"])
app.include_router(compare.router, prefix="/api/compare", tags=["compare"])


@app.get("/health")
def health():
    return {"status": "ok"}

