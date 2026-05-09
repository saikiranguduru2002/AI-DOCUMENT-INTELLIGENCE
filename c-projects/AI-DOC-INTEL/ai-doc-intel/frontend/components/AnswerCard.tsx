"use client"

type Source = {
  page_number?: number | null
  excerpt?: string | null
}

type Props = {
  answer: string
  sources?: Source[]
  confidence?: number
}

export function AnswerCard({ answer, sources = [], confidence }: Props) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
          Answer
        </h2>
        {typeof confidence === "number" ? (
          <div className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
            Confidence: {confidence.toFixed(3)}
          </div>
        ) : null}
      </div>

      <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-900 dark:text-zinc-100">
        {answer}
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
          Sources
        </h3>
        {sources.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            No citations returned.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {sources.map((s, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-zinc-200 bg-zinc-50/40 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Page {s.page_number ?? "—"}
                </div>
                <div className="mt-1 text-sm leading-6 text-zinc-900 dark:text-zinc-100">
                  {s.excerpt ?? ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

