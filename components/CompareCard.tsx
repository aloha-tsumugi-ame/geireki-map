import Link from "next/link"
import type { Comedian } from "@/types/comedian"
import { compareComedians } from "@/lib/compareComedians"
import { formatCareerStartYear, formatMemberCareerStartYear } from "@/lib/careerStart"
import { formatSchool } from "@/lib/formatSchool"
import { getCurrentMembers } from "@/lib/members"
import { KindBadge, StatusBadge } from "@/components/Badges"

export default function CompareCard({
  a,
  b,
}: {
  a: Comedian
  b: Comedian
}) {
  const result = compareComedians(a, b)
  const comparable = a.careerStartYear !== null && b.careerStartYear !== null && a.id !== b.id
  // 芸歴上先の方を強調する
  const leader =
    comparable && a.careerStartYear !== b.careerStartYear
      ? (a.careerStartYear as number) < (b.careerStartYear as number)
        ? a.id
        : b.id
      : null

  const rows: [string, (c: Comedian) => string][] = [
    [
      "メンバー",
      (c) =>
        c.members
          ? getCurrentMembers(c)
              .map((m) => `${m.name}（${formatMemberCareerStartYear(m)}）`)
              .join("、")
          : "-",
    ],
    ["結成", (c) => (c.members ? (c.formationYear ? `${c.formationYear}年` : "不明") : "-")],
    ["所属", (c) => c.agency ?? "不明"],
    ["養成所", (c) => formatSchool(c)],
  ]

  return (
    <div className="space-y-6">
      <div className="grid items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <Side comedian={a} highlight={leader === a.id} />
        <div className="flex items-center justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink font-display text-sm text-paper">
            VS
          </span>
        </div>
        <Side comedian={b} highlight={leader === b.id} />
      </div>

      <div
        className={`rounded-3xl px-6 py-5 text-center ${
          comparable ? "bg-shu text-white" : "border-2 border-dashed border-line bg-card text-ink-soft"
        }`}
      >
        <p className={comparable ? "font-display text-xl sm:text-2xl" : "text-sm font-bold"}>
          {result}
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-line bg-card">
        <table className="w-full text-sm">
          <tbody>
            {rows.map(([label, getValue]) => (
              <tr key={label} className="border-b border-line last:border-b-0">
                <th className="w-24 bg-paper-deep/60 px-4 py-3 text-left text-xs font-bold text-muted">
                  {label}
                </th>
                <td className="px-4 py-3 align-top">{getValue(a)}</td>
                <td className="border-l border-line px-4 py-3 align-top">{getValue(b)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-center text-xs text-muted">
        ※芸歴開始年の差を示すもので、実際の先輩・後輩関係を断定するものではありません。
      </p>
    </div>
  )
}

function Side({ comedian, highlight }: { comedian: Comedian; highlight: boolean }) {
  return (
    <Link
      href={`/comedians/${comedian.slug}`}
      className={`flex flex-col items-center rounded-3xl border-2 bg-card px-5 py-6 text-center transition-transform hover:-translate-y-0.5 ${
        highlight ? "border-shu shadow-[6px_6px_0_0_var(--color-shu)]" : "border-ink shadow-[6px_6px_0_0_var(--color-ink)]"
      }`}
    >
      <KindBadge comedian={comedian} />
      <span className="mt-2 font-display text-2xl">{comedian.name}</span>
      <span className="mt-3 text-[11px] font-bold text-muted">芸歴開始</span>
      <span className={`font-display text-4xl ${comedian.careerStartYear ? "text-shu" : "text-muted"}`}>
        {comedian.careerStartYear ?? formatCareerStartYear(comedian)}
      </span>
      <span className="mt-2">
        <StatusBadge status={comedian.careerStartYearStatus} />
      </span>
    </Link>
  )
}
