import os
from typing import List, Dict

from services.openai_client import (
    default_chat_model,
    get_openai_client,
)

client = get_openai_client()


def answer_question(question: str, context_chunks: List[Dict]) -> Dict:
    """Answer a question using retrieved context chunks"""
    context = "\n\n---\n\n".join(
        [f"[Page {c['page_number']}]: {c['content']}" for c in context_chunks]
    )

    system_prompt = """You are an expert document analyst.

Answer using ONLY the provided document context.

If the question is broad (e.g., "what is this document about?"), give a short high-level summary of what the document appears to be and what it contains, based on the context.

If the answer is not in the context, say "I couldn't find that in the document."

Always cite page number(s) as (Page N). Be concise and accurate."""

    response = client.chat.completions.create(
        model=default_chat_model(),
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion: {question}",
            },
        ],
        temperature=0.1,
    )

    answer = response.choices[0].message.content
    sources = [
        {"page_number": c["page_number"], "excerpt": c["content"][:200]}
        for c in context_chunks
    ]

    return {
        "answer": answer,
        "sources": sources,
        "confidence": max([c["similarity"] for c in context_chunks]) if context_chunks else 0,
    }


def extract_structured_data(content: str) -> Dict:
    """Extract tables, dates, names, and key facts as JSON"""
    response = client.chat.completions.create(
        model=default_chat_model(),
        messages=[
            {
                "role": "system",
                "content": """Extract structured data from this document content.
Return a JSON object with these keys:
- dates: list of {date, context}
- names: list of {name, role_or_context}
- tables: list of {title, headers, rows}
- key_facts: list of {fact, context}
- summary: 2-sentence summary

Return ONLY valid JSON, no markdown.""",
            },
            {"role": "user", "content": content[:4000]},  # limit tokens
        ],
        temperature=0,
        response_format={"type": "json_object"},
    )
    import json

    return json.loads(response.choices[0].message.content)


def compare_documents(
    content_a: str, content_b: str, doc_a_name: str, doc_b_name: str
) -> Dict:
    """Compare two documents and return differences"""
    response = client.chat.completions.create(
        model=default_chat_model(),
        messages=[
            {
                "role": "system",
                "content": """Compare these two documents and return a JSON object with:
- similarities: list of key points that are the same
- differences: list of {topic, doc_a_says, doc_b_says}
- doc_a_unique: things only in document A
- doc_b_unique: things only in document B
- verdict: 1-sentence overall comparison summary

Return ONLY valid JSON.""",
            },
            {
                "role": "user",
                "content": f"Document A ({doc_a_name}):\n{content_a[:2000]}\n\nDocument B ({doc_b_name}):\n{content_b[:2000]}",
            },
        ],
        temperature=0,
        response_format={"type": "json_object"},
    )
    import json

    return json.loads(response.choices[0].message.content)

