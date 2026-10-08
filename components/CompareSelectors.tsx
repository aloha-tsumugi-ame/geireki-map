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

  const sorted = [...comedians].sort((x, y) => x.name.localeCompare(y.name, "ja"))

  return (
    <div className="grid items-center gap-3 rounded-3xl border border-line bg-card p-4 sm:grid-cols-[1fr_auto_1fr] sm:p-5">
      <Select label="1組目" value={first} options={sorted} onChange={(v) => updateParam("first", v)} />
      <span className="text-center font-display text-sm text-muted">VS</span>
      <Select label="2組目" value={second} options={sorted} onChange={(v) => updateParam("second", v)} />
    </div>
  )
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value?: string
  options: Comedian[]
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold text-muted">{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full cursor-pointer rounded-xl border-2 border-ink bg-paper px-4 py-3 text-sm font-bold outline-none focus:border-shu"
      >
        <option value="">芸人を選択</option>
        {options.map((c) => (
          <option key={c.id} value={c.slug}>
            {c.name}
            {c.careerStartYear ? `（${c.careerStartYear}）` : ""}
          </option>
        ))}
      </select>
    </label>
  )
}
