"use client"

import { useState } from "react"
import { AnswerCard } from "@/components/AnswerCard"
import { QueryInput } from "@/components/QueryInput"

type Source = {
  page_number?: number | null
  excerpt?: string | null
}

type QueryResult = {
  answer: string
  sources?: Source[]
  confidence?: number
}

export default function QueryPage() {
  const [result, setResult] = useState<QueryResult | null>(null)

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Q&amp;A
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Ask questions in plain English and get answers with citations.
          </p>
        </div>

        <QueryInput onResult={setResult} />

        {result ? (
          <AnswerCard
            answer={result.answer}
            sources={result.sources ?? []}
            confidence={result.confidence}
          />
        ) : null}
      </div>
    </div>
  )
}

