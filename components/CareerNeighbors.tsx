import ComedianCard from "@/components/ComedianCard"
import type { CareerNeighborGroup } from "@/lib/getCareerNeighbors"
import { yearEntryKey } from "@/lib/careerStart"

// 「先輩・後輩」とは断定せず、芸歴開始年の差として表示する
function labelForOffset(offset: number) {
  if (offset < 0) return `芸歴上${Math.abs(offset)}年先`
  return `芸歴上${offset}年後`
}

export default function CareerNeighbors({
  groups,
  baseYear,
}: {
  groups: CareerNeighborGroup[]
  baseYear: number
}) {
  if (groups.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
        前後2年以内に登録されている芸人はいません。
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.offset} className="grid gap-3 sm:grid-cols-[8rem_1fr]">
          <div className="flex items-baseline gap-2 sm:flex-col sm:gap-0.5">
            <span
              className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-bold ${
                group.offset < 0 ? "bg-ink text-paper" : "bg-paper-deep text-ink-soft"
              }`}
            >
              {labelForOffset(group.offset)}
            </span>
            <span className="font-display text-lg text-ink-soft">
              {baseYear + group.offset}
            </span>
          </div>
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
