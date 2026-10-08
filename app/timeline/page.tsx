import type { Metadata } from "next"
import { getUndatedComedians, getYearEntries } from "@/lib/debut"
import CareerTimeline from "@/components/CareerTimeline"

export const metadata: Metadata = {
  title: "芸歴タイムライン",
  description: "登録されている芸人を芸歴開始年ごとに一覧できます。",
}

export default function TimelinePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold">芸歴タイムライン</h1>
      <p className="mt-2 text-sm text-neutral-500">
        芸歴開始年ごとに芸人を一覧できます
      </p>
      <p className="mt-1 text-xs text-neutral-400">
        ※メンバーごとに芸歴開始年が異なるグループは、メンバー名を添えてそれぞれの年に表示しています
      </p>

      <div className="mt-8">
        <CareerTimeline
          entries={getYearEntries()}
          undated={getUndatedComedians()}
        />
      </div>
    </div>
  )
}
