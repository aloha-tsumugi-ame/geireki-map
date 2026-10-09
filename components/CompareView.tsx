"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { getCompareTarget } from "@/lib/compareTargets"
import ComparePicker from "@/components/ComparePicker"
import CompareCard from "@/components/CompareCard"

// 静的書き出し（GitHub Pages）ではサーバーでクエリを読めないため、ブラウザ側で ?first=&second= を読む。
// 値はグループ・ピン芸人なら slug、メンバー個人なら person id。
export default function CompareView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const first = searchParams.get("first") || undefined
  const second = searchParams.get("second") || undefined

  const a = getCompareTarget(first)
  const b = getCompareTarget(second)

  function update(key: "first" | "second", value: string) {
    const params = new URLSearchParams()
    const next = { first: first ?? "", second: second ?? "", [key]: value }
    if (next.first) params.set("first", next.first)
    if (next.second) params.set("second", next.second)
    const query = params.toString()
    router.push(query ? `/compare?${query}` : "/compare")
  }

  return (
    <>
      <div className="grid items-start gap-3 rounded-3xl border border-line bg-card p-4 sm:grid-cols-[1fr_auto_1fr] sm:p-5">
        <ComparePicker
          label="1人目・1組目"
          value={a}
          onSelect={(v) => update("first", v)}
          onClear={() => update("first", "")}
        />
        <span className="pt-2 text-center text-sm font-bold text-muted sm:pt-9">と</span>
        <ComparePicker
          label="2人目・2組目"
          value={b}
          onSelect={(v) => update("second", v)}
          onClear={() => update("second", "")}
        />
      </div>
      <p className="-mt-4 text-center text-[11px] text-muted">
        グループ・ピン芸人のほか、グループのメンバー個人でも比較できます
      </p>

      {a && b ? (
        <CompareCard a={a} b={b} />
      ) : (
        <p className="rounded-3xl border-2 border-dashed border-line px-4 py-12 text-center text-sm text-muted">
          比較する芸人を2人（2組）選択してください
        </p>
      )}
    </>
  )
}
