import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <main className="w-full max-w-4xl">
        <div className="rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              AI Document Intelligence Tool
            </h1>
            <p className="mt-3 text-base leading-7 text-zinc-600 dark:text-zinc-400">
              Upload PDFs/DOCX, ask questions with citations, extract structured data,
              compare documents, and export results — with Supabase Auth + history.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/dashboard"
              className="rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/30"
            >
              <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                Dashboard
              </div>
              <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Sign in, view documents, and query history.
              </div>
            </Link>

            <Link
              href="/upload"
              className="rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/30"
            >
              <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                Upload
              </div>
              <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Upload a PDF/DOCX and process it for search.
              </div>
            </Link>

            <Link
              href="/query"
              className="rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/30"
            >
              <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                Q&amp;A
              </div>
              <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Ask questions and see cited sources.
              </div>
            </Link>

            <Link
              href="/extract"
              className="rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/30"
            >
              <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                Extract
              </div>
              <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Get structured JSON + export CSV.
              </div>
            </Link>

            <Link
              href="/compare"
              className="rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/30"
            >
              <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                Compare
              </div>
              <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Compare two documents and summarize changes.
              </div>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/40 p-5 text-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-zinc-700 dark:text-zinc-300">
              Tip: Start at <span className="font-medium">Dashboard</span> to sign in.
            </div>
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-white"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
