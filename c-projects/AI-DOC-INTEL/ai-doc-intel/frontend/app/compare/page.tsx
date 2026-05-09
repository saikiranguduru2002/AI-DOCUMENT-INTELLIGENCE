"use client"

import { CompareView } from "@/components/CompareView"

export default function ComparePage() {
  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Compare
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Compare two documents and see what changed.
          </p>
        </div>

        <CompareView />
      </div>
    </div>
  )
}

