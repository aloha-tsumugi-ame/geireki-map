"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import CareerTimeline from "@/components/CareerTimeline"
import { KindBadge } from "@/components/Badges"
import { getUndatedComedians, getYearEntries } from "@/lib/careerStart"
import { getComedian } from "@/lib/getComedian"
import { getCurrentMembers } from "@/lib/members"
import { searchComedians } from "@/lib/searchComedians"

// タイムライン上で芸人を検索し、詳細ページへは移動せずに該当箇所を強調表示する。
// ?focus=<slug> で開いた場合も同じように強調する（詳細ページの「タイムラインで見る」から使う）。
export default function TimelineExplorer() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [keyword, setKeyword] = useState("")
  const focusSlug = searchParams.get("focus") || undefined
  const focused = focusSlug ? getComedian(focusSlug) : undefined

  const entries = getYearEntries()
  const undated = getUndatedComedians()
  const results = useMemo(() => searchComedians(keyword).slice(0, 8), [keyword])

  // 強調した芸人のチップまでスクロールする
  useEffect(() => {
    if (!focused) return
    const el = document.querySelector(`[data-comedian="${focused.id}"]`)
    el?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [focused])

  function focus(slug: string | undefined) {
    setKeyword("")
    router.replace(slug ? `/timeline?focus=${slug}` : "/timeline", { scroll: false })
  }

  // 強調した芸人がどの年に表示されているか（メンバー単位で表示されるグループは複数の年）
  const focusedYears = focused
    ? entries
        .filter((e) => e.comedian.id === focused.id)
        .map((e) => (e.member ? `${e.year}年（${e.member.name}）` : `${e.year}年`))
    : []

  return (
    <>
      <div className="sticky top-[57px] z-20 -mx-4 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur">
        <div className="relative mx-auto max-w-2xl">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) {
                e.preventDefault()
                focus(results[0].slug)
              }
            }}
            placeholder="タイムライン上で芸人を探す（例：千鳥、大悟）"
            aria-label="タイムライン上で芸人を探す"
            autoComplete="off"
            className="w-full rounded-full border-2 border-ink bg-card px-5 py-2.5 text-sm outline-none placeholder:text-muted focus:border-shu"
          />
          {keyword.trim() && (
            <ul className="absolute z-30 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-line bg-card shadow-xl">
              {results.length === 0 ? (
                <li className="px-4 py-3 text-sm text-muted">該当する芸人が見つかりませんでした</li>
              ) : (
                results.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => focus(c.slug)}
                      className="flex w-full items-center gap-3 border-b border-line px-4 py-2.5 text-left last:border-b-0 hover:bg-shu-soft/60"
                    >
                      <span className="w-11 shrink-0 text-center font-display text-sm text-shu">
                        {c.careerStartYear ?? "—"}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate font-bold">{c.name}</span>
                          <KindBadge comedian={c} />
                        </span>
                        {c.members && (
                          <span className="block truncate text-[11px] text-muted">
                            {getCurrentMembers(c).map((m) => m.name).join("・")}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        {focused && (
          <div className="mx-auto mt-2 flex max-w-2xl flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-shu px-4 py-2 text-sm text-white">
            <span className="font-bold">{focused.name}</span>
            <span className="text-white/85">
              {focusedYears.length > 0 ? `芸歴開始 ${focusedYears.join("・")}` : "芸歴開始年不明"}
            </span>
            <span className="ml-auto flex gap-2">
              <Link
                href={`/comedians/${focused.slug}`}
                className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold hover:bg-white/25"
              >
                詳細を見る
              </Link>
              <button
                type="button"
                onClick={() => focus(undefined)}
                className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold hover:bg-white/25"
              >
                解除
              </button>
            </span>
          </div>
        )}
      </div>

      <div className="pt-8">
        <CareerTimeline entries={entries} undated={undated} highlightId={focused?.id} />
      </div>
    </>
  )
}
