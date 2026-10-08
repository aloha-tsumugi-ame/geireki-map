import Link from "next/link"
import type { Comedian, Member } from "@/types/comedian"
import { formatDebutYear } from "@/lib/debut"

// member を渡すと、芸歴開始年が null のグループをそのメンバーの年で表示する
export default function ComedianCard({
  comedian,
  member,
}: {
  comedian: Comedian
  member?: Member
}) {
  const debutLabel =
    member?.debutYear != null
      ? `${member.debutYear}年（${member.name}）`
      : formatDebutYear(comedian)

  return (
    <Link
      href={`/comedians/${comedian.slug}`}
      className="block rounded-lg border border-black/10 px-4 py-3 hover:border-black/30 hover:bg-neutral-50 transition-colors"
    >
      <div className="font-medium">{comedian.name}</div>
      <div className="text-xs text-neutral-500 mt-0.5">
        芸歴開始 {debutLabel}
        {comedian.agency ? ` ・ ${comedian.agency}` : ""}
      </div>
    </Link>
  )
}
