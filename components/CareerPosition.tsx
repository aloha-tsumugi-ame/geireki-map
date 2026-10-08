import CareerNeighbors from "@/components/CareerNeighbors"
import ComedianCard from "@/components/ComedianCard"
import { getCareerNeighbors } from "@/lib/getCareerNeighbors"
import { getSameYearDebut } from "@/lib/getSameYearDebut"
import { yearEntryKey } from "@/lib/debut"

// 芸歴開始年 year を基準にした前後2年・同年デビューの一覧
export default function CareerPosition({
  year,
  excludeId,
}: {
  year: number
  excludeId: string
}) {
  const neighbors = getCareerNeighbors(year, excludeId, 2)
  const sameYear = getSameYearDebut(year, excludeId)

  return (
    <>
      <CareerNeighbors groups={neighbors} />

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-neutral-600 mb-2">
          同年デビュー（{year}年）
        </h3>
        {sameYear.length === 0 ? (
          <p className="text-sm text-neutral-500">
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
        <p className="mt-2 text-xs text-neutral-400">
          ※芸歴開始年が同じ芸人です。養成所の同期などを意味するものではありません。
        </p>
      </div>
    </>
  )
}
