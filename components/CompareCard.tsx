import Link from "next/link"
import { compareTargets } from "@/lib/compareComedians"
import { describeMemberTarget, type CompareTarget } from "@/lib/compareTargets"
import { formatCareerStartYear, formatMemberCareerStartYear } from "@/lib/careerStart"
import { formatMemberSchool, formatSchool } from "@/lib/formatSchool"
import { getCurrentMembers } from "@/lib/members"
import { getKindLabel } from "@/lib/display"
import { StatusBadge } from "@/components/Badges"

export default function CompareCard({
  a,
  b,
}: {
  a: CompareTarget
  b: CompareTarget
}) {
  const result = compareTargets(a, b)
  const comparable = a.careerStartYear !== null && b.careerStartYear !== null && a.key !== b.key
  const yearGap = comparable
    ? Math.abs((a.careerStartYear as number) - (b.careerStartYear as number))
    : null
  // 芸歴上先輩の方を強調する
  const leader =
    comparable && a.careerStartYear !== b.careerStartYear
      ? (a.careerStartYear as number) < (b.careerStartYear as number)
        ? a.key
        : b.key
      : null

  const rows: [string, (t: CompareTarget) => string][] = [
    ["種別", (t) => (t.kind === "member" ? `個人（${describeMemberTarget(t)}）` : getKindLabel(t.comedian))],
    [
      "メンバー",
      (t) =>
        t.kind === "entry" && t.comedian.members
          ? getCurrentMembers(t.comedian)
              .map((m) => `${m.name}（${formatMemberCareerStartYear(m)}）`)
              .join("、")
          : "-",
    ],
    [
      "結成",
      (t) =>
        t.kind === "entry" && t.comedian.members
          ? t.comedian.formationYear
            ? `${t.comedian.formationYear}年`
            : "不明"
          : "-",
    ],
    ["所属", (t) => t.comedian.agency ?? "不明"],
    ["養成所", (t) => (t.member ? formatMemberSchool(t.member) : formatSchool(t.comedian))],
  ]

  return (
    <div className="space-y-6">
      <div className="grid items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <Side target={a} highlight={leader === a.key} />
        {/* 2組の間には芸歴開始年の差を表示する */}
        <div className="flex items-center justify-center">
          <span className="flex h-16 w-16 flex-col items-center justify-center rounded-full bg-ink text-paper">
            {yearGap === null ? (
              <span className="text-[11px] font-bold">比較</span>
            ) : yearGap === 0 ? (
              <span className="text-[11px] font-bold">同じ年</span>
            ) : (
              <>
                <span className="font-display text-lg leading-none">{yearGap}</span>
                <span className="mt-0.5 text-[10px] font-bold">年差</span>
              </>
            )}
          </span>
        </div>
        <Side target={b} highlight={leader === b.key} />
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

function Side({ target, highlight }: { target: CompareTarget; highlight: boolean }) {
  return (
    <Link
      href={`/comedians/${target.comedian.slug}`}
      className={`flex flex-col items-center rounded-3xl border-2 bg-card px-5 py-6 text-center transition-transform hover:-translate-y-0.5 ${
        highlight ? "border-shu shadow-[6px_6px_0_0_var(--color-shu)]" : "border-ink shadow-[6px_6px_0_0_var(--color-ink)]"
      }`}
    >
      <span className="inline-flex items-center rounded-full border border-ink/15 px-2 py-0.5 text-[11px] font-medium text-ink-soft">
        {target.kind === "member" ? describeMemberTarget(target) : getKindLabel(target.comedian)}
      </span>
      <span className="mt-2 font-display text-2xl">{target.name}</span>
      <span className="mt-3 text-[11px] font-bold text-muted">芸歴開始</span>
      <span className={`font-display text-4xl ${target.careerStartYear ? "text-shu" : "text-muted"}`}>
        {target.careerStartYear ??
          (target.kind === "member" ? "不明" : formatCareerStartYear(target.comedian))}
      </span>
      <span className="mt-2">
        <StatusBadge status={target.careerStartYearStatus} />
      </span>
    </Link>
  )
}
