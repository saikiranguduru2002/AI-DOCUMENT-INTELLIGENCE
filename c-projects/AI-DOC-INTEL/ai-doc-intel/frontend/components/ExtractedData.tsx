"use client"

type ExtractedDate = { date?: string; context?: string }
type ExtractedName = { name?: string; role_or_context?: string }
type ExtractedTable = {
  title?: string
  headers?: string[]
  rows?: (string | number | boolean | null)[][]
}
type ExtractedFact = { fact?: string; context?: string }

export type ExtractedPayload = {
  dates?: ExtractedDate[]
  names?: ExtractedName[]
  tables?: ExtractedTable[]
  key_facts?: ExtractedFact[]
  summary?: string
}

function safeString(v: unknown) {
  if (v === null || v === undefined) return ""
  if (typeof v === "string") return v
  if (typeof v === "number" || typeof v === "boolean") return String(v)
  return JSON.stringify(v)
}

function csvEscape(value: string) {
  const needsQuotes = /[",\n\r]/.test(value)
  const escaped = value.replace(/"/g, '""')
  return needsQuotes ? `"${escaped}"` : escaped
}

function toCsv(headers: string[], rows: string[][]) {
  const headerLine = headers.map((h) => csvEscape(h)).join(",")
  const body = rows
    .map((r) => r.map((c) => csvEscape(c)).join(","))
    .join("\n")
  return [headerLine, body].filter(Boolean).join("\n")
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

type Props = {
  data: ExtractedPayload
}

export function ExtractedData({ data }: Props) {
  const tables = data.tables ?? []
  const names = data.names ?? []
  const dates = data.dates ?? []
  const facts = data.key_facts ?? []

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
            Extracted data
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Structured fields returned by the model.
          </p>
        </div>
      </div>

      {data.summary ? (
        <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50/40 p-4 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
          <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Summary
          </div>
          <div className="mt-2 whitespace-pre-wrap leading-7">{data.summary}</div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              Names
            </h3>
            <button
              type="button"
              onClick={() => {
                const csv = toCsv(
                  ["name", "role_or_context"],
                  names.map((n) => [safeString(n.name), safeString(n.role_or_context)])
                )
                downloadCsv("names.csv", csv)
              }}
              disabled={names.length === 0}
              className="rounded-full px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Export CSV
            </button>
          </div>
          {names.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">None.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {names.map((n, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="font-medium text-zinc-950 dark:text-zinc-50">
                    {n.name ?? "—"}
                  </div>
                  <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    {n.role_or_context ?? ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              Dates
            </h3>
            <button
              type="button"
              onClick={() => {
                const csv = toCsv(
                  ["date", "context"],
                  dates.map((d) => [safeString(d.date), safeString(d.context)])
                )
                downloadCsv("dates.csv", csv)
              }}
              disabled={dates.length === 0}
              className="rounded-full px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Export CSV
            </button>
          </div>
          {dates.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">None.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {dates.map((d, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="font-medium text-zinc-950 dark:text-zinc-50">
                    {d.date ?? "—"}
                  </div>
                  <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    {d.context ?? ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            Key facts
          </h3>
          <button
            type="button"
            onClick={() => {
              const csv = toCsv(
                ["fact", "context"],
                facts.map((f) => [safeString(f.fact), safeString(f.context)])
              )
              downloadCsv("key_facts.csv", csv)
            }}
            disabled={facts.length === 0}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Export CSV
          </button>
        </div>
        {facts.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">None.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {facts.map((f, i) => (
              <div
                key={i}
                className="rounded-xl border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="font-medium text-zinc-950 dark:text-zinc-50">
                  {f.fact ?? "—"}
                </div>
                <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  {f.context ?? ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
          Tables
        </h3>
        {tables.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">None.</p>
        ) : (
          <div className="mt-3 space-y-4">
            {tables.map((t, idx) => {
              const headers = t.headers ?? []
              const rows = (t.rows ?? []).map((r) => r.map((c) => safeString(c)))

              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                      {t.title?.trim() ? t.title : `Table ${idx + 1}`}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const csv = toCsv(headers, rows)
                        downloadCsv(
                          `table_${idx + 1}.csv`,
                          csv.length ? csv : "No data"
                        )
                      }}
                      className="rounded-full px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    >
                      Export CSV
                    </button>
                  </div>

                  <div className="mt-3 overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-0">
                      {headers.length > 0 ? (
                        <thead>
                          <tr>
                            {headers.map((h, i) => (
                              <th
                                key={i}
                                className="whitespace-nowrap border-b border-zinc-200 px-3 py-2 text-left text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:text-zinc-300"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                      ) : null}
                      <tbody>
                        {rows.map((r, ri) => (
                          <tr key={ri}>
                            {r.map((c, ci) => (
                              <td
                                key={ci}
                                className="whitespace-nowrap border-b border-zinc-100 px-3 py-2 text-xs text-zinc-900 dark:border-zinc-900/40 dark:text-zinc-100"
                              >
                                {c}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

