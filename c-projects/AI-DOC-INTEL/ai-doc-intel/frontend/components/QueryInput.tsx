"use client"

import { useCallback, useMemo, useState } from "react"
import { queryDocument } from "@/lib/api"

type Source = {
  page_number?: number | null
  excerpt?: string | null
}

type QueryResult = {
  answer: string
  sources?: Source[]
  confidence?: number
}

type Props = {
  onResult: (result: QueryResult) => void
}

export function QueryInput({ onResult }: Props) {
  const [documentId, setDocumentId] = useState("")
  const [question, setQuestion] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(() => {
    return documentId.trim().length > 0 && question.trim().length > 0 && !isLoading
  }, [documentId, question, isLoading])

  const submit = useCallback(async () => {
    if (!canSubmit) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await queryDocument(documentId.trim(), question.trim())
      if (data?.answer) {
        onResult({
          answer: data.answer,
          sources: data.sources ?? [],
          confidence: data.confidence,
        })
      } else {
        setError(data?.detail ?? "Query failed")
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Query failed")
    } finally {
      setIsLoading(false)
    }
  }, [canSubmit, documentId, question, onResult])

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
        Ask a question
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Paste a document ID from Upload, then ask anything about the document.
      </p>

      <div className="mt-5 grid gap-3">
        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Document ID
          </span>
          <input
            value={documentId}
            onChange={(e) => setDocumentId(e.target.value)}
            placeholder="e.g. 2a3f0c9c-..."
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Question
          </span>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What does the contract say about termination?"
            rows={4}
            className="min-h-[110px] resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm leading-6 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600"
          />
        </label>

        <div className="mt-1 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-white"
          >
            {isLoading ? "Asking…" : "Ask"}
          </button>
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  )
}

