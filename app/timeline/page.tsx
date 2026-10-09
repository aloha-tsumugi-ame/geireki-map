import type { Metadata } from "next"
import { Suspense } from "react"
import { getUndatedComedians, getYearEntries } from "@/lib/careerStart"
import CareerTimeline from "@/components/CareerTimeline"
import PageHeader from "@/components/PageHeader"
import TimelineExplorer from "@/components/TimelineExplorer"

export const metadata: Metadata = {
  title: "芸歴タイムライン",
  description: "登録されている芸人を芸歴開始年ごとに一覧できます。",
}

export default function TimelinePage() {
  const entries = getYearEntries()
  const decades = Array.from(
    new Set(entries.map((e) => Math.floor(e.year / 10) * 10))
  ).sort((a, b) => a - b)

  return (
    <div>
      <PageHeader
        eyebrow="TIMELINE"
        title="芸歴タイムライン"
        description={
          <>
            <p>芸歴開始年ごとに芸人を一覧できます。検索すると、その芸人がタイムラインのどこにいるかを強調表示します。</p>
            <p className="mt-1 text-xs text-muted">
              ※メンバーごとに芸歴開始年が異なるグループは、メンバー名を添えてそれぞれの年に表示しています
            </p>
          </>
        }
      >
        <nav className="mt-6 flex flex-wrap gap-2">
          {decades.map((decade) => (
            <a
              key={decade}
              href={`#decade-${decade}`}
              className="rounded-full border-2 border-ink bg-card px-3.5 py-1.5 font-display text-xs transition-colors hover:bg-ink hover:text-paper"
            >
              {decade}年代
            </a>
          ))}
        </nav>
      </PageHeader>

      <div className="mx-auto max-w-5xl px-4">
        {/* 静的HTMLには検索なしのタイムラインを出し、ブラウザで検索付きに置き換える */}
        <Suspense
          fallback={
            <div className="pt-10">
              <CareerTimeline entries={entries} undated={getUndatedComedians()} />
            </div>
          }
        >
          <TimelineExplorer />
        </Suspense>
      </div>
    </div>
  )
}
