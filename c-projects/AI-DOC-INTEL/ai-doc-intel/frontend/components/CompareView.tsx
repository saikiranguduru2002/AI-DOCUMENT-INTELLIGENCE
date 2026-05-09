"use client"

import { useCallback, useMemo, useState } from "react"
import { compareDocuments } from "@/lib/api"

type Difference = {
  topic?: string
  doc_a_says?: string
  doc_b_says?: string
}

type CompareResult = {
  similarities?: string[]
  differences?: Difference[]
  doc_a_unique?: string[]
  doc_b_unique?: string[]
  verdict?: string
}

export function CompareView() {
  const [docA, setDocA] = useState("")
  const [docB, setDocB] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CompareResult | null>(null)

  const canRun = useMemo(() => {
    return docA.trim().length > 0 && docB.trim().length > 0 && !busy
  }, [docA, docB, busy])

  const run = useCallback(async () => {
    if (!canRun) return
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const data = await compareDocuments(docA.trim(), docB.trim())
      if (data?.detail) {
        setError(data.detail)
        return
      }
      setResult(data as CompareResult)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Comparison failed")
    } finally {
      setBusy(false)
    }
  }, [canRun, docA, docB])

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
          Compare documents
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Paste two document IDs to find similarities and differences.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Document A ID
            </span>
            <input
              value={docA}
              onChange={(e) => setDocA(e.target.value)}
              placeholder="document_id_a"
              className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Document B ID
            </span>
            <input
              value={docB}
              onChange={(e) => setDocB(e.target.value)}
              placeholder="document_id_b"
              className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600"
            />
          </label>
        </div>

        <div className="mt-4 flex items-center justify-end">
          <button
            type="button"
            onClick={run}
            disabled={!canRun}
            className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-white"
          >
            {busy ? "Comparing…" : "Compare"}
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
            {error}
          </div>
        ) : null}
      </div>

      {result ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
              Results
            </h2>
            {result.verdict ? (
              <div className="max-w-2xl rounded-xl border border-zinc-200 bg-zinc-50/40 px-4 py-3 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
                <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Verdict
                </div>
                <div className="mt-1">{result.verdict}</div>
              </div>
            ) : null}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section>
              <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                Similarities
              </h3>
              {(result.similarities ?? []).length === 0 ? (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  None returned.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {result.similarities?.map((s, i) => (
                    <li
                      key={i}
                      className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                Differences
              </h3>
              {(result.differences ?? []).length === 0 ? (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  None returned.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {result.differences?.map((d, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
                    >
                      <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                        {d.topic ?? `Difference ${i + 1}`}
                      </div>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl border border-zinc-200 bg-zinc-50/40 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                          <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            Document A
                          </div>
                          <div className="mt-1 whitespace-pre-wrap leading-6 text-zinc-900 dark:text-zinc-100">
                            {d.doc_a_says ?? ""}
                          </div>
                        </div>
                        <div className="rounded-xl border border-zinc-200 bg-zinc-50/40 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                          <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            Document B
                          </div>
                          <div className="mt-1 whitespace-pre-wrap leading-6 text-zinc-900 dark:text-zinc-100">
                            {d.doc_b_says ?? ""}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section>
              <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                Unique to Document A
              </h3>
              {(result.doc_a_unique ?? []).length === 0 ? (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  None returned.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {result.doc_a_unique?.map((s, i) => (
                    <li
                      key={i}
                      className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                Unique to Document B
              </h3>
              {(result.doc_b_unique ?? []).length === 0 ? (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  None returned.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {result.doc_b_unique?.map((s, i) => (
                    <li
                      key={i}
                      className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      ) : null}
    </div>
  )
}

