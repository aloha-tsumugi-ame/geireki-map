import type { Comedian } from "@/types/comedian"
import { compareComedians } from "@/lib/compareComedians"
import { formatCareerStartYear, formatMemberCareerStartYear } from "@/lib/careerStart"
import { formatSchool } from "@/lib/formatSchool"

export default function CompareCard({
  a,
  b,
}: {
  a: Comedian
  b: Comedian
}) {
  const result = compareComedians(a, b)

  const rows: [string, (c: Comedian) => string][] = [
    ["芸歴開始", formatCareerStartYear],
    [
      "メンバー",
      (c) =>
        c.members
          ? c.members
              .map((m) => `${m.name}（${formatMemberCareerStartYear(m)}）`)
              .join("、")
          : "-",
    ],
    ["結成", (c) => (c.members ? (c.formationYear ? `${c.formationYear}年` : "不明") : "-")],
    ["所属", (c) => c.agency ?? "不明"],
    ["養成所", (c) => formatSchool(c)],
  ]

  return (
    <div className="rounded-lg border border-black/10 overflow-hidden">
      <div className="px-4 py-4 text-center bg-neutral-50">
        <div className="flex items-center justify-center gap-4 text-lg font-semibold">
          <span>{a.name}</span>
          <span className="text-sm text-neutral-400 font-normal">VS</span>
          <span>{b.name}</span>
        </div>
        <p className="mt-2 text-sm text-neutral-700">{result}</p>
      </div>

      <table className="w-full text-sm">
        <tbody>
          {rows.map(([label, getValue]) => (
            <tr key={label} className="border-t border-black/5">
              <td className="px-4 py-2.5 text-neutral-500 w-24">{label}</td>
              <td className="px-4 py-2.5">{getValue(a)}</td>
              <td className="px-4 py-2.5">{getValue(b)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-4 py-2 text-xs text-neutral-400 border-t border-black/5">
        ※芸歴開始年の差を示すもので、実際の先輩・後輩関係を断定するものではありません。
      </p>
    </div>
  )
}
