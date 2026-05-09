"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type DocumentRow = {
  id: string
  filename: string
  file_type: string
  status: string
  created_at: string
  page_count: number | null
  file_url: string
}

type QueryRow = {
  id: string
  question: string
  answer: string
  confidence: number | null
  created_at: string
  sources: unknown
}

export default function DashboardPage() {
  const [email, setEmail] = useState("")
  const [authError, setAuthError] = useState<string | null>(null)
  const [authBusy, setAuthBusy] = useState(false)
  const [sessionEmail, setSessionEmail] = useState<string | null>(null)

  const [docs, setDocs] = useState<DocumentRow[]>([])
  const [docsBusy, setDocsBusy] = useState(false)
  const [docsError, setDocsError] = useState<string | null>(null)

  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [queries, setQueries] = useState<QueryRow[]>([])
  const [queriesBusy, setQueriesBusy] = useState(false)
  const [queriesError, setQueriesError] = useState<string | null>(null)

  const loadSession = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    setSessionEmail(session?.user?.email ?? null)
    return session
  }, [])

  const loadDocs = useCallback(async () => {
    setDocsBusy(true)
    setDocsError(null)
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("id, filename, file_type, status, created_at, page_count, file_url")
        .order("created_at", { ascending: false })

      if (error) throw error
      setDocs((data ?? []) as DocumentRow[])
      setSelectedDocId((data?.[0]?.id as string | undefined) ?? null)
    } catch (e) {
      setDocsError(e instanceof Error ? e.message : "Failed to load documents")
    } finally {
      setDocsBusy(false)
    }
  }, [])

  const loadQueries = useCallback(async (docId: string) => {
    setQueriesBusy(true)
    setQueriesError(null)
    try {
      const { data, error } = await supabase
        .from("queries")
        .select("id, question, answer, confidence, created_at, sources")
        .eq("document_id", docId)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error
      setQueries((data ?? []) as QueryRow[])
    } catch (e) {
      setQueriesError(e instanceof Error ? e.message : "Failed to load queries")
    } finally {
      setQueriesBusy(false)
    }
  }, [])

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user?.email ?? null)
    })

    // Initial load (in case the auth state is already available).
    const t = setTimeout(() => {
      void loadSession()
    }, 0)

    return () => {
      clearTimeout(t)
      sub.subscription.unsubscribe()
    }
  }, [loadSession])

  useEffect(() => {
    if (!sessionEmail) return
    const t = setTimeout(() => {
      void loadDocs()
    }, 0)
    return () => clearTimeout(t)
  }, [sessionEmail, loadDocs])

  useEffect(() => {
    if (!sessionEmail || !selectedDocId) return
    const t = setTimeout(() => {
      void loadQueries(selectedDocId)
    }, 0)
    return () => clearTimeout(t)
  }, [sessionEmail, selectedDocId, loadQueries])

  const signIn = useCallback(async () => {
    setAuthBusy(true)
    setAuthError(null)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin + "/dashboard" },
      })
      if (error) throw error
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : "Sign in failed")
    } finally {
      setAuthBusy(false)
    }
  }, [email])

  const signInWithGoogle = useCallback(async () => {
    setAuthBusy(true)
    setAuthError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + "/dashboard" },
      })
      if (error) throw error
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : "Google sign in failed")
    } finally {
      setAuthBusy(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setSessionEmail(null)
    setDocs([])
    setSelectedDocId(null)
    setQueries([])
  }, [])

  const selectedDoc = useMemo(() => {
    return docs.find((d) => d.id === selectedDocId) ?? null
  }, [docs, selectedDocId])

  if (!sessionEmail) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Use your email to get a magic link via Supabase Auth.
          </p>
          <div className="mt-5 grid gap-3">
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={authBusy}
              className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              {authBusy ? "Opening Google…" : "Sign in with Google"}
            </button>

            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
              <div className="text-xs font-medium text-zinc-500">or</div>
              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            </div>

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600"
            />
            <button
              type="button"
              onClick={signIn}
              disabled={authBusy || email.trim().length === 0}
              className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-white"
            >
              {authBusy ? "Sending link…" : "Send magic link"}
            </button>
            {authError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
                {authError}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-6 py-10 dark:bg-black">
      <div className="w-full max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Signed in as <span className="font-medium">{sessionEmail}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
              href="/upload"
            >
              Upload
            </Link>
            <Link
              className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
              href="/query"
            >
              Q&amp;A
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-white"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                Documents
              </h2>
              <button
                type="button"
                onClick={loadDocs}
                className="rounded-full px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                disabled={docsBusy}
              >
                {docsBusy ? "Refreshing…" : "Refresh"}
              </button>
            </div>

            {docsError ? (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
                {docsError}
              </div>
            ) : null}

            <div className="mt-3 space-y-2">
              {docs.length === 0 && !docsBusy ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  No documents yet. Upload one to get started.
                </p>
              ) : null}

              {docs.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDocId(d.id)}
                  className={[
                    "w-full rounded-xl border px-3 py-3 text-left transition-colors",
                    d.id === selectedDocId
                      ? "border-zinc-900 bg-zinc-50 dark:border-zinc-200 dark:bg-zinc-900/30"
                      : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/30",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-zinc-950 dark:text-zinc-50">
                        {d.filename}
                      </div>
                      <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                        {d.file_type.toUpperCase()} • {d.status}
                        {typeof d.page_count === "number"
                          ? ` • ${d.page_count} pages`
                          : ""}
                      </div>
                    </div>
                    <div className="shrink-0 font-mono text-[10px] text-zinc-500 dark:text-zinc-500">
                      {d.id.slice(0, 8)}…
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                  Query history
                </h2>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  {selectedDoc ? (
                    <>
                      Document: <span className="font-medium">{selectedDoc.filename}</span>{" "}
                      <span className="font-mono">{selectedDoc.id}</span>
                    </>
                  ) : (
                    "Select a document to view its queries."
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedDocId ? (
                  <button
                    type="button"
                    onClick={() => loadQueries(selectedDocId)}
                    disabled={queriesBusy}
                    className="rounded-full px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  >
                    {queriesBusy ? "Refreshing…" : "Refresh"}
                  </button>
                ) : null}
              </div>
            </div>

            {queriesError ? (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
                {queriesError}
              </div>
            ) : null}

            <div className="mt-4 space-y-3">
              {selectedDocId && queries.length === 0 && !queriesBusy ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  No queries yet for this document. Try asking something in{" "}
                  <Link className="underline" href="/query">
                    Q&amp;A
                  </Link>
                  .
                </p>
              ) : null}

              {queries.map((q) => (
                <div
                  key={q.id}
                  className="rounded-xl border border-zinc-200 bg-zinc-50/40 p-4 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Q: {q.question}
                  </div>
                  <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-900 dark:text-zinc-100">
                    {q.answer}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-400">
                    <span className="font-mono">{q.id.slice(0, 8)}…</span>
                    {typeof q.confidence === "number" ? (
                      <span>confidence {q.confidence.toFixed(3)}</span>
                    ) : null}
                    <span>{new Date(q.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

