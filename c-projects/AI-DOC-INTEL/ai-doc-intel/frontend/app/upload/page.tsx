import { FileUpload } from "@/components/FileUpload"

export default function UploadPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Upload
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Upload a PDF/DOCX to make it searchable for Q&A, extraction, and
            comparison.
          </p>
        </div>

        <FileUpload />
      </div>
    </div>
  )
}

