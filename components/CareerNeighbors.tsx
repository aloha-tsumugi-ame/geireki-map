import ComedianCard from "@/components/ComedianCard"
import type { CareerNeighborGroup } from "@/lib/getCareerNeighbors"
import { yearEntryKey } from "@/lib/debut"

// 「先輩・後輩」とは断定せず、芸歴開始年の差として表示する
function labelForOffset(offset: number) {
  if (offset < 0) return `芸歴上${Math.abs(offset)}年先`
  return `芸歴上${offset}年後`
}

export default function CareerNeighbors({
  groups,
}: {
  groups: CareerNeighborGroup[]
}) {
  if (groups.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        前後2年以内に登録されている芸人はいません。
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.offset}>
          <h3 className="text-sm font-semibold text-neutral-600 mb-2">
            {labelForOffset(group.offset)}
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {group.entries.map((entry) => (
              <ComedianCard
                key={yearEntryKey(entry)}
                comedian={entry.comedian}
                member={entry.member}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
