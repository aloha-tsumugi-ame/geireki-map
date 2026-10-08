import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getYearEntries, getYearEntriesByYear, yearEntryKey } from "@/lib/careerStart"
import { getCareerYears } from "@/lib/display"
import ComedianCard from "@/components/ComedianCard"
import PageHeader from "@/components/PageHeader"

function getYears() {
  return Array.from(new Set(getYearEntries().map((entry) => entry.year))).sort(
    (a, b) => a - b
  )
}

export function generateStaticParams() {
  return getYears().map((year) => ({ year: String(year) }))
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
    title: `芸歴開始年が${year}年の芸人一覧`,
    description: `芸歴開始年が${year}年の芸人を一覧で確認できます。`,
  }
}

export default async function CareerStartYearPage({
  params,
}: {
  params: Promise<{ year: string }>
}) {
  const { year } = await params
  if (!/^\d{4}$/.test(year)) {
    notFound()
  }

  const yearNumber = Number(year)
  const entries = getYearEntriesByYear(yearNumber)
  const years = getYears()
  const prev = [...years].reverse().find((y) => y < yearNumber)
  const next = years.find((y) => y > yearNumber)

  return (
    <div>
      <PageHeader
        eyebrow="CAREER START"
        title={
          <>
            <span className="text-shu">{year}</span>年に芸歴を始めた芸人
          </>
        }
        description={
          <>
            <p>
              芸歴 {getCareerYears(yearNumber)} 年目（目安）の芸人です。
              {entries.length > 0 && `${entries.length}組が登録されています。`}
            </p>
            <p className="mt-1 text-xs text-muted">
              ※芸歴開始年が同じ芸人です。養成所の同期などを意味するものではありません。
            </p>
          </>
        }
      >
        <nav className="mt-6 flex flex-wrap items-center gap-2 text-sm">
          {prev && (
            <Link
              href={`/debut/${prev}`}
              className="rounded-full border-2 border-ink bg-card px-4 py-1.5 font-bold transition-colors hover:bg-ink hover:text-paper"
            >
              ← {prev}
            </Link>
          )}
          <Link
            href={`/timeline#year-${year}`}
            className="rounded-full px-4 py-1.5 text-ink-soft hover:text-shu"
          >
            タイムラインで見る
          </Link>
          {next && (
            <Link
              href={`/debut/${next}`}
              className="rounded-full border-2 border-ink bg-card px-4 py-1.5 font-bold transition-colors hover:bg-ink hover:text-paper"
            >
              {next} →
            </Link>
          )}
        </nav>
      </PageHeader>

      <div className="mx-auto max-w-5xl px-4 pt-10">
        {entries.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">
            該当する芸人は登録されていません。
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
    </div>
  )
}
