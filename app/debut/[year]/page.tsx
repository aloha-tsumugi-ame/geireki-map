import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getYearEntries, getYearEntriesByYear, yearEntryKey } from "@/lib/debut"
import ComedianCard from "@/components/ComedianCard"

export function generateStaticParams() {
  const years = new Set(getYearEntries().map((entry) => entry.year))
  return Array.from(years).map((year) => ({ year: String(year) }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>
}): Promise<Metadata> {
  const { year } = await params
  if (!/^\d{4}$/.test(year)) {
    return {}
  }
  return {
    title: `${year}年デビューの芸人一覧`,
    description: `芸歴開始年が${year}年の芸人を一覧で確認できます。`,
  }
}

export default async function DebutYearPage({
  params,
}: {
  params: Promise<{ year: string }>
}) {
  const { year } = await params
  if (!/^\d{4}$/.test(year)) {
    notFound()
  }

  const entries = getYearEntriesByYear(Number(year))

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold">{year}年デビューの芸人</h1>
      <p className="mt-2 text-xs text-neutral-400">
        ※芸歴開始年が{year}年の芸人（同年デビュー）です。養成所の同期などを意味するものではありません。
      </p>

      {entries.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">
          該当する芸人は登録されていません。
        </p>
      ) : (
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {entries.map((entry) => (
            <ComedianCard
              key={yearEntryKey(entry)}
              comedian={entry.comedian}
              member={entry.member}
            />
          ))}
        </div>
      )}
    </div>
  )
}
