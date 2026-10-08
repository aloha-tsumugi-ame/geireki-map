import Link from "next/link"
import { notFound, permanentRedirect } from "next/navigation"
import type { Metadata } from "next"
import {
  getAllComedians,
  getComedian,
  getComedianByMemberId,
} from "@/lib/getComedian"
import {
  DEBUT_TYPE_LABELS,
  DEBUT_YEAR_STATUS_LABELS,
  formatMemberDebutYear,
  getNullDebutReason,
} from "@/lib/debut"
import { formatMemberSchool, formatSchool } from "@/lib/formatSchool"
import CareerPosition from "@/components/CareerPosition"

export function generateStaticParams() {
  return getAllComedians().map((comedian) => ({
    slug: comedian.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const comedian = getComedian(slug)

  if (!comedian) {
    return {}
  }

  return {
    title: `${comedian.name}の芸歴・同年デビュー・前後の芸人`,
    description: `${comedian.name}の芸歴開始年、同年デビュー、芸歴上1〜2年前後の芸人を一覧で確認できます。`,
  }
}

export default async function ComedianDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const comedian = getComedian(slug)

  if (!comedian) {
    // 旧来メンバー個人単位で登録していた芸人のURL（/comedians/person-xxxx）はグループへ
    const group = getComedianByMemberId(slug)
    if (group) {
      permanentRedirect(`/comedians/${group.slug}`)
    }
    notFound()
  }

  const isGroup = Boolean(comedian.members)
  const datedMembers = (comedian.members ?? []).filter(
    (m) => m.debutYear != null
  )
  const timelineYear = comedian.debutYear ?? datedMembers[0]?.debutYear
  const hasUnverifiedDebut =
    comedian.debutYearStatus === "secondary_source" ||
    comedian.debutYearStatus === "estimated" ||
    (comedian.debutYear === null && datedMembers.length > 0)

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-bold">{comedian.name}</h1>
      {comedian.nameKana && (
        <p className="text-sm text-neutral-500 mt-0.5">{comedian.nameKana}</p>
      )}

      <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm max-w-lg">
        <dt className="text-neutral-500">芸歴開始</dt>
        <dd>
          {comedian.debutYear !== null ? (
            <>
              {comedian.debutYear}年
              <span className="text-xs text-neutral-500">
                （
                {comedian.debutYearStatus
                  ? DEBUT_YEAR_STATUS_LABELS[comedian.debutYearStatus]
                  : "未確認"}
                {comedian.debutType &&
                  comedian.debutType !== "secondary_source_editorial" &&
                  ` ・ 基準: ${DEBUT_TYPE_LABELS[comedian.debutType]}`}
                ）
              </span>
            </>
          ) : getNullDebutReason(comedian) === "mixed" ? (
            "メンバーにより異なる"
          ) : (
            "不明"
          )}
        </dd>

        {isGroup && (
          <>
            <dt className="text-neutral-500">結成</dt>
            <dd>{comedian.formationYear ? `${comedian.formationYear}年` : "不明"}</dd>
          </>
        )}

        <dt className="text-neutral-500">所属</dt>
        <dd>{comedian.agency ?? "不明"}</dd>

        <dt className="text-neutral-500">養成所</dt>
        <dd>{formatSchool(comedian)}</dd>

        {comedian.schoolEquivalent && (
          <>
            <dt className="text-neutral-500">養成所の期相当</dt>
            <dd>{comedian.schoolEquivalent}</dd>
          </>
        )}

        {comedian.members && comedian.members.length > 0 && (
          <>
            <dt className="text-neutral-500">メンバー</dt>
            <dd>
              <ul className="space-y-0.5">
                {comedian.members.map((m) => (
                  <li key={m.id ?? m.name}>
                    {m.name}
                    <span className="text-xs text-neutral-500">
                      {" "}
                      芸歴開始 {formatMemberDebutYear(m)}
                      {(m.school || !comedian.school) &&
                        ` ・ 養成所 ${formatMemberSchool(m)}`}
                      {m.schoolEquivalent && !comedian.schoolEquivalent &&
                        ` ・ ${m.schoolEquivalent}相当`}
                    </span>
                  </li>
                ))}
              </ul>
            </dd>
          </>
        )}
      </dl>

      {comedian.debutYear === null && isGroup && (
        <p className="mt-2 text-xs text-neutral-400 max-w-lg">
          {getNullDebutReason(comedian) === "mixed"
            ? "※メンバーごとに芸歴開始年が異なるため、グループとしての芸歴開始年は設定していません。"
            : "※一部メンバーの芸歴開始年が未確認のため、グループとしての芸歴開始年は設定していません。"}
        </p>
      )}

      <section className="mt-12">
        <h2 className="text-lg font-semibold mb-4">芸歴上の位置</h2>

        {comedian.debutYear !== null ? (
          <CareerPosition year={comedian.debutYear} excludeId={comedian.id} />
        ) : datedMembers.length > 0 ? (
          <div className="space-y-10">
            {datedMembers.map((member) => (
              <div key={member.id ?? member.name}>
                <h3 className="text-base font-semibold mb-3">
                  {member.name}（芸歴開始 {member.debutYear}年）を基準にした場合
                </h3>
                <CareerPosition
                  year={member.debutYear as number}
                  excludeId={comedian.id}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500">
            芸歴開始年が不明なため表示できません。
          </p>
        )}

        {comedian.debutYear === null &&
          comedian.members?.some((m) => m.debutYear == null) && (
            <p className="mt-4 text-xs text-neutral-400">
              ※
              {comedian.members
                .filter((m) => m.debutYear == null)
                .map((m) => m.name)
                .join("、")}
              は芸歴開始年が不明のため表示していません。
            </p>
          )}
      </section>

      <section className="mt-12 flex flex-wrap gap-3">
        <Link
          href={timelineYear ? `/timeline#year-${timelineYear}` : "/timeline#year-unknown"}
          className="text-sm rounded-lg border border-black/15 px-4 py-2 hover:bg-neutral-50"
        >
          タイムラインを見る
        </Link>
        <Link
          href={`/compare?first=${comedian.slug}`}
          className="text-sm rounded-lg border border-black/15 px-4 py-2 hover:bg-neutral-50"
        >
          別の芸人と比較する
        </Link>
      </section>

      <section className="mt-12 border-t border-black/10 pt-6">
        <h2 className="text-sm font-semibold text-neutral-600">
          出典・芸歴の定義
        </h2>
        {comedian.sources.length === 0 ? (
          <p className="mt-2 text-xs text-neutral-500">出典は未登録です。</p>
        ) : (
          <ul className="mt-2 text-xs text-neutral-500 space-y-1">
            {comedian.sources.map((source, i) => (
              <li key={i}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-black"
                >
                  {source.title}
                </a>
                {source.checkedAt && `（参照日: ${source.checkedAt}）`}
              </li>
            ))}
          </ul>
        )}
        {hasUnverifiedDebut && (
          <p className="mt-3 text-xs text-neutral-400 leading-relaxed">
            芸歴開始年は二次情報源の値で、公式情報による確認は済んでいません。
          </p>
        )}
        <p className="mt-3 text-xs text-neutral-400 leading-relaxed">
          本サイトの芸歴の前後関係は芸歴開始年（debutYear）の差を示す独自の目安です。
          実際の芸能界上の先輩後輩関係を断定するものではありません。
        </p>
      </section>
    </div>
  )
}
