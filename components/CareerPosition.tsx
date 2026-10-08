import CareerNeighbors from "@/components/CareerNeighbors"
import ComedianCard from "@/components/ComedianCard"
import { getCareerNeighbors } from "@/lib/getCareerNeighbors"
import { getSameCareerStartYear } from "@/lib/getSameCareerStartYear"
import { yearEntryKey } from "@/lib/careerStart"

// 芸歴開始年 year を基準にした前後2年・芸歴開始年が同じ芸人の一覧。
// 芸歴上先 → 同じ年 → 芸歴上後 の順に並べる。
export default function CareerPosition({
  year,
  excludeId,
}: {
  year: number
  excludeId: string
}) {
  const neighbors = getCareerNeighbors(year, excludeId, 2)
  const sameYear = getSameCareerStartYear(year, excludeId)
  const before = neighbors.filter((g) => g.offset < 0)
  const after = neighbors.filter((g) => g.offset > 0)

  return (
    <div className="space-y-8">
      {before.length > 0 && <CareerNeighbors groups={before} baseYear={year} />}

      <div className="rounded-3xl border-2 border-shu/30 bg-shu-soft/50 p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="inline-flex rounded-full bg-shu px-2.5 py-0.5 text-xs font-bold text-white">
            芸歴開始年が同じ芸人
          </span>
          <span className="font-display text-lg text-shu-deep">{year}</span>
        </div>
        {sameYear.length === 0 ? (
          <p className="text-sm text-muted">
            同じ芸歴開始年の芸人は登録されていません。
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {sameYear.map((entry) => (
              <ComedianCard
                key={yearEntryKey(entry)}
                comedian={entry.comedian}
                member={entry.member}
              />
            ))}
          </div>
        )}
        <p className="mt-3 text-[11px] text-muted">
          ※芸歴開始年が同じ芸人です。養成所の同期などを意味するものではありません。
        </p>
      </div>

      {after.length > 0 && <CareerNeighbors groups={after} baseYear={year} />}

      {neighbors.length === 0 && <CareerNeighbors groups={[]} baseYear={year} />}
    </div>
  )
}
