"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { searchComedians } from "@/lib/searchComedians"
import { formatCareerStartYear } from "@/lib/careerStart"
import { getCurrentMembers, getFormerMembers } from "@/lib/members"
import { KindBadge } from "@/components/Badges"

export default function ComedianSearch() {
  const [keyword, setKeyword] = useState("")

  const results = useMemo(() => searchComedians(keyword).slice(0, 8), [keyword])

  return (
    <div className="relative">
      <div className="relative">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="text"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="芸人名・メンバー名で検索（例：千鳥、岩井勇気）"
          aria-label="芸人を検索"
          className="w-full rounded-2xl border-2 border-ink bg-card py-4 pl-13 pr-5 text-base shadow-[4px_4px_0_0_var(--color-ink)] outline-none transition-shadow placeholder:text-muted focus:shadow-[6px_6px_0_0_var(--color-shu)]"
        />
      </div>

      {keyword.trim() && (
        <div className="absolute z-20 mt-3 w-full overflow-hidden rounded-2xl border border-line bg-card text-left shadow-xl">
          {results.length === 0 ? (
            <div className="px-5 py-4 text-sm text-muted">
              該当する芸人が見つかりませんでした
            </div>
          ) : (
            results.map((comedian) => (
              <Link
                key={comedian.id}
                href={`/comedians/${comedian.slug}`}
                className="flex items-center gap-4 border-b border-line px-5 py-3 last:border-b-0 hover:bg-shu-soft/60"
              >
                <span className="w-12 shrink-0 text-center font-display text-base text-shu">
                  {comedian.careerStartYear ?? "—"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-bold">{comedian.name}</span>
                    <KindBadge comedian={comedian} />
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted">
                    {comedian.members && comedian.members.length > 0
                      ? [
                          ...getCurrentMembers(comedian).map((m) => m.name),
                          ...getFormerMembers(comedian).map((m) => `${m.name}（元メンバー）`),
                        ].join("、")
                      : comedian.careerStartYear !== null
                        ? `芸歴開始 ${comedian.careerStartYear}年`
                        : `芸歴開始 ${formatCareerStartYear(comedian)}`}
                  </span>
                </span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
