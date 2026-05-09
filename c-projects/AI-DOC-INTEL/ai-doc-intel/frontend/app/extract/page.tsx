"use client"

import { useCallback, useState } from "react"
import { extractData } from "@/lib/api"
import { ExtractedData, type ExtractedPayload } from "@/components/ExtractedData"

export default function ExtractPage() {
  const [documentId, setDocumentId] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ExtractedPayload | null>(null)

  const run = useCallback(async () => {
    setBusy(true)
    setError(null)
    setData(null)
    try {
      const res = await extractData(documentId.trim())
      if (res?.detail) {
        setError(res.detail)
        return
      }
      setData(res as ExtractedPayload)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Extraction failed")
    } finally {
      setBusy(false)
    }
  }, [documentId])

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Structured extraction
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Extract dates, names, tables, key facts, and a summary as JSON — with
            CSV export.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Document ID
            </span>
            <input
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              placeholder="Paste a document_id from Upload or Dashboard"
              className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600"
            />
          </label>

          <div className="mt-4 flex items-center justify-end">
            <button
              type="button"
              onClick={run}
              disabled={busy || documentId.trim().length === 0}
              className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-white"
            >
              {busy ? "Extracting…" : "Extract"}
            </button>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
              {error}
            </div>
          ) : null}
        </div>

        {data ? <ExtractedData data={data} /> : null}
      </div>
    </div>
  )
}

