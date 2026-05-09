"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { uploadDocument } from "@/lib/api"

type UploadResult =
  | { ok: true; document_id: string; filename?: string; status?: string }
  | { ok: false; error: string }

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return ""
  const units = ["B", "KB", "MB", "GB"]
  let value = bytes
  let i = 0
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i++
  }
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

export function FileUpload() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)

  const isSupported = useMemo(() => {
    if (!file) return true
    const name = file.name.toLowerCase()
    return name.endsWith(".pdf") || name.endsWith(".docx")
  }, [file])

  const pickFile = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const onFiles = useCallback((files: FileList | null) => {
    const f = files?.[0] ?? null
    setResult(null)
    setFile(f)
  }, [])

  const upload = useCallback(async () => {
    if (!file) return
    setIsUploading(true)
    setResult(null)
    try {
      const data = await uploadDocument(file)
      if (data?.document_id) {
        setResult({
          ok: true,
          document_id: data.document_id,
          filename: data.filename,
          status: data.status,
        })
      } else {
        setResult({ ok: false, error: data?.detail ?? "Upload failed" })
      }
    } catch (e) {
      setResult({
        ok: false,
        error: e instanceof Error ? e.message : "Upload failed",
      })
    } finally {
      setIsUploading(false)
    }
  }, [file])

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
              Upload a document
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              PDF or DOCX. We’ll parse, chunk, and embed it for Q&A.
            </p>
          </div>
          <button
            type="button"
            onClick={pickFile}
            className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Choose file
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />

        <div
          className={[
            "mt-5 rounded-xl border-2 border-dashed p-8 transition-colors",
            isDragging
              ? "border-zinc-900 bg-zinc-50 dark:border-zinc-200 dark:bg-zinc-900/40"
              : "border-zinc-200 bg-zinc-50/40 dark:border-zinc-800 dark:bg-zinc-950",
          ].join(" ")}
          onDragEnter={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            setIsDragging(false)
          }}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            onFiles(e.dataTransfer.files)
          }}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Drag & drop your file here
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Or click “Choose file”
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="min-w-0">
              <div className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                {file ? file.name : "No file selected"}
              </div>
              {file ? (
                <div className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                  {formatBytes(file.size)}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => {
                setFile(null)
                setResult(null)
              }}
              className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
              disabled={!file || isUploading}
            >
              Clear
            </button>
          </div>

          {!isSupported && file ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
              Only PDF and DOCX are supported.
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={upload}
              disabled={!file || !isSupported || isUploading}
              className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-white"
            >
              {isUploading ? "Uploading…" : "Upload & process"}
            </button>
          </div>

          {result ? (
            result.ok ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
                <div className="font-medium">Upload complete</div>
                <div className="mt-1">
                  Document ID:{" "}
                  <span className="font-mono text-xs">{result.document_id}</span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
                <div className="font-medium">Upload failed</div>
                <div className="mt-1">{result.error}</div>
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  )
}

