"use client"

import { useId, useMemo, useState } from "react"
import {
  describeMemberTarget,
  searchCompareTargets,
  type CompareTarget,
} from "@/lib/compareTargets"
import { getKindLabel } from "@/lib/display"

// 比較対象を検索して選ぶ。グループ・ピン芸人だけでなくメンバー個人も選べる。
export default function ComparePicker({
  label,
  value,
  onSelect,
  onClear,
}: {
  label: string
  value?: CompareTarget
  onSelect: (key: string) => void
  onClear: () => void
}) {
  const [keyword, setKeyword] = useState("")
  const inputId = useId()
  const results = useMemo(() => searchCompareTargets(keyword), [keyword])

  function select(target: CompareTarget) {
    onSelect(target.key)
    setKeyword("")
  }

  if (value) {
    return (
      <div>
        <span className="text-[11px] font-bold text-muted">{label}</span>
        <div className="mt-1 flex items-center gap-3 rounded-xl border-2 border-ink bg-paper px-4 py-2.5">
          <span className="min-w-0 flex-1">
            <span className="block truncate font-bold">{value.name}</span>
            <span className="block truncate text-[11px] text-muted">
              {describeMemberTarget(value) ?? getKindLabel(value.comedian)}
              {value.careerStartYear !== null && ` ・ 芸歴開始 ${value.careerStartYear}年`}
            </span>
          </span>
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 rounded-full border border-ink/20 px-3 py-1 text-xs font-bold text-ink-soft hover:bg-ink hover:text-paper"
          >
            変更
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <label htmlFor={inputId} className="text-[11px] font-bold text-muted">
        {label}
      </label>
      <input
        id={inputId}
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && results[0]) {
            e.preventDefault()
            select(results[0])
          }
        }}
        placeholder="芸人名・メンバー名で検索"
        autoComplete="off"
        className="mt-1 w-full rounded-xl border-2 border-ink bg-paper px-4 py-3 text-sm font-bold outline-none placeholder:font-normal placeholder:text-muted focus:border-shu"
      />

      {keyword.trim() && (
        <ul className="absolute z-20 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-line bg-card shadow-xl">
          {results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted">該当する芸人が見つかりませんでした</li>
          ) : (
            results.map((target) => (
              <li key={target.key}>
                <button
                  type="button"
                  onClick={() => select(target)}
                  className="flex w-full items-center gap-3 border-b border-line px-4 py-2.5 text-left last:border-b-0 hover:bg-shu-soft/60"
                >
                  <span className="w-11 shrink-0 text-center font-display text-sm text-shu">
                    {target.careerStartYear ?? "—"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate ${target.kind === "member" ? "pl-3 text-sm" : "font-bold"}`}>
                      {target.kind === "member" && <span className="mr-1 text-muted">└</span>}
                      {target.name}
                    </span>
                    <span className={`block truncate text-[11px] text-muted ${target.kind === "member" ? "pl-3" : ""}`}>
                      {describeMemberTarget(target) ?? getKindLabel(target.comedian)}
                    </span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
