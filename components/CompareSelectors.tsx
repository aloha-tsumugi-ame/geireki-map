"use client"

import { useRouter } from "next/navigation"
import type { Comedian } from "@/types/comedian"

export default function CompareSelectors({
  comedians,
  first,
  second,
}: {
  comedians: Comedian[]
  first?: string
  second?: string
}) {
  const router = useRouter()

  function updateParam(key: "first" | "second", value: string) {
    const params = new URLSearchParams()
    params.set("first", key === "first" ? value : first ?? "")
    params.set("second", key === "second" ? value : second ?? "")
    router.push(`/compare?${params.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
      <select
        value={first ?? ""}
        onChange={(e) => updateParam("first", e.target.value)}
        className="rounded-lg border border-black/20 px-4 py-2.5 text-sm min-w-48"
      >
        <option value="">芸人を選択</option>
        {comedians.map((c) => (
          <option key={c.id} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>

      <span className="text-sm text-neutral-400 font-medium">VS</span>

      <select
        value={second ?? ""}
        onChange={(e) => updateParam("second", e.target.value)}
        className="rounded-lg border border-black/20 px-4 py-2.5 text-sm min-w-48"
      >
        <option value="">芸人を選択</option>
        {comedians.map((c) => (
          <option key={c.id} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  )
}
