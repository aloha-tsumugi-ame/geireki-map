import type { Metadata } from "next"
import { getUndatedComedians, getYearEntries } from "@/lib/careerStart"
import CareerTimeline from "@/components/CareerTimeline"
import PageHeader from "@/components/PageHeader"

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
            <p>芸歴開始年ごとに芸人を一覧できます。年をクリックすると、その年に芸歴を始めた芸人の一覧へ移動します。</p>
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

      <div className="mx-auto max-w-5xl px-4 pt-10">
        <CareerTimeline entries={entries} undated={getUndatedComedians()} />
      </div>
    </div>
  )
}
