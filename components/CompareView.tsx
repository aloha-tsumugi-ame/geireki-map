"use client"

import { useSearchParams } from "next/navigation"
import { getAllComedians, getComedian } from "@/lib/getComedian"
import CompareSelectors from "@/components/CompareSelectors"
import CompareCard from "@/components/CompareCard"

// 静的書き出し（GitHub Pages）ではサーバーでクエリを読めないため、ブラウザ側で ?first=&second= を読む
export default function CompareView() {
  const searchParams = useSearchParams()
  const first = searchParams.get("first") || undefined
  const second = searchParams.get("second") || undefined

  const a = first ? getComedian(first) : undefined
  const b = second ? getComedian(second) : undefined

  return (
    <>
      <CompareSelectors comedians={getAllComedians()} first={first} second={second} />

      {a && b ? (
        <CompareCard a={a} b={b} />
      ) : (
        <p className="rounded-3xl border-2 border-dashed border-line px-4 py-12 text-center text-sm text-muted">
          2組の芸人を選択してください
        </p>
      )}
    </>
  )
}
