const API_URL = process.env.NEXT_PUBLIC_API_URL

async function getAuthHeader() {
  const { supabase } = await import("./supabase")
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return { Authorization: `Bearer ${session?.access_token}` }
}

export async function uploadDocument(file: File) {
  const headers = await getAuthHeader()
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API_URL}/api/upload/`, { method: 'POST', headers, body: form })
  return res.json()
}

export async function queryDocument(documentId: string, question: string) {
  const headers = await getAuthHeader()
  const res = await fetch(`${API_URL}/api/query/`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_id: documentId, question }),
  })
  return res.json()
}

export async function extractData(documentId: string) {
  const headers = await getAuthHeader()
  const res = await fetch(`${API_URL}/api/extract/`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_id: documentId }),
  })
  return res.json()
}

export async function compareDocuments(docIdA: string, docIdB: string) {
  const headers = await getAuthHeader()
  const res = await fetch(`${API_URL}/api/compare/`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_id_a: docIdA, document_id_b: docIdB }),
  })
  return res.json()
}

