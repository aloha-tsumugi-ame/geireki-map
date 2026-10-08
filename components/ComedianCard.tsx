import Link from "next/link"
import type { Comedian, Member } from "@/types/comedian"
import { formatCareerStartYear } from "@/lib/careerStart"
import { KindBadge } from "@/components/Badges"
import { getCurrentMembers } from "@/lib/members"

// member を渡すと、芸歴開始年が null のグループをそのメンバーの年で表示する
export default function ComedianCard({
  comedian,
  member,
}: {
  comedian: Comedian
  member?: Member
}) {
  const year = member?.careerStartYear ?? comedian.careerStartYear
  // 2行目: メンバー基準の年なら誰の年か、グループならメンバー名、ピンなら所属
  const sub = member
    ? `${member.name}の芸歴開始年`
    : comedian.members
      ? getCurrentMembers(comedian).map((m) => m.name).join("・")
      : comedian.agency ??
        (year === null ? `芸歴開始 ${formatCareerStartYear(comedian)}` : null)

  return (
    <Link
      href={`/comedians/${comedian.slug}`}
      className="group flex items-stretch overflow-hidden rounded-2xl border border-line bg-card transition-all hover:-translate-y-0.5 hover:border-shu/50 hover:shadow-[0_8px_24px_-12px_rgb(29_26_22/0.25)]"
    >
      <div className="flex w-20 shrink-0 flex-col items-center justify-center bg-paper-deep px-2 py-3 transition-colors group-hover:bg-shu group-hover:text-white">
        <span className="font-display text-lg leading-none">{year ?? "—"}</span>
        <span className="mt-1 text-[10px] text-muted group-hover:text-white/80">
          {year ? "芸歴開始" : "年不明"}
        </span>
      </div>
      <div className="min-w-0 flex-1 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="truncate font-bold">{comedian.name}</span>
          <KindBadge comedian={comedian} />
        </div>
        {sub && <div className="mt-1 truncate text-xs text-muted">{sub}</div>}
      </div>
    </Link>
  )
}
