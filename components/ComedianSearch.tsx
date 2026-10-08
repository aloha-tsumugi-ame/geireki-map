"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { searchComedians } from "@/lib/searchComedians"
import { formatCareerStartYear } from "@/lib/careerStart"
import { getCurrentMembers, getFormerMembers } from "@/lib/members"

export default function ComedianSearch() {
  const [keyword, setKeyword] = useState("")

  const results = useMemo(() => searchComedians(keyword).slice(0, 8), [keyword])

  return (
    <div className="relative">
      <input
        type="text"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="芸人名を検索（例：千鳥）"
        className="w-full rounded-lg border border-black/20 px-4 py-3 text-base outline-none focus:border-black/50"
      />

      {keyword.trim() && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-black/10 bg-white shadow-lg overflow-hidden">
          {results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-neutral-500">
              該当する芸人が見つかりませんでした
            </div>
          ) : (
            results.map((comedian) => (
              <Link
                key={comedian.id}
                href={`/comedians/${comedian.slug}`}
                className="block px-4 py-2.5 text-sm hover:bg-neutral-50 border-b border-black/5 last:border-b-0"
              >
                <span className="font-medium">{comedian.name}</span>
                <span className="text-neutral-500 ml-2 text-xs">
                  {comedian.careerStartYear !== null
                    ? `芸歴開始 ${comedian.careerStartYear}年`
                    : `芸歴開始 ${formatCareerStartYear(comedian)}`}
                </span>
                {comedian.members && comedian.members.length > 0 && (
                  <span className="block text-neutral-400 text-xs mt-0.5">
                    {[
                      ...getCurrentMembers(comedian).map((m) => m.name),
                      ...getFormerMembers(comedian).map((m) => `${m.name}（元メンバー）`),
                    ].join("、")}
                  </span>
                )}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
