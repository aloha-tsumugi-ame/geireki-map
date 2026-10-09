import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import type { Member } from "@/types/comedian"
import {
  getAllComedians,
  getComedian,
  getComedianByMemberId,
} from "@/lib/getComedian"
import {
  CAREER_START_BASIS_LABELS,
  formatMemberCareerStartYear,
  getNullCareerStartReason,
} from "@/lib/careerStart"
import { formatMemberSchool, formatSchool } from "@/lib/formatSchool"
import { getCareerYears } from "@/lib/display"
import CareerPosition from "@/components/CareerPosition"
import { KindBadge, StatusBadge } from "@/components/Badges"
import {
  formatFormerMember,
  getCurrentMembers,
  getFormerMembers,
} from "@/lib/members"

// 静的書き出し（GitHub Pages）のため、ビルド時に全ページを生成し、それ以外は404にする
export const dynamicParams = false

export function generateStaticParams() {
  const comedians = getAllComedians()
  return [
    ...comedians.map((comedian) => ({ slug: comedian.slug })),
    // 旧来メンバー個人単位で登録していた芸人のURL（/comedians/person-xxxx）→ グループへ転送するページ
    ...comedians.flatMap((comedian) =>
      (comedian.members ?? []).flatMap((member) =>
        member.id ? [{ slug: member.id }] : []
      )
    ),
  ]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const comedian = getComedian(slug)

  if (!comedian) {
    const group = getComedianByMemberId(slug)
    return group
      ? { title: `${group.name}へ移動しました`, robots: { index: false } }
      : {}
  }

  return {
    title: `${comedian.name}の芸歴開始年・前後の芸人`,
    description: `${comedian.name}の芸歴開始年、芸歴開始年が同じ芸人、芸歴上1〜2年前後の芸人を一覧で確認できます。`,
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
    // 静的ホスティングではサーバーで転送できないため、meta refresh で転送する
    const group = getComedianByMemberId(slug)
    if (group) {
      return <LegacyRedirect to={`/comedians/${group.slug}/`} name={group.name} />
    }
    notFound()
  }

  const isGroup = Boolean(comedian.members)
  const currentMembers = getCurrentMembers(comedian)
  const formerMembers = getFormerMembers(comedian)
  const datedMembers = currentMembers.filter(
    (m) => m.careerStartYear != null
  )
  const timelineYear = comedian.careerStartYear ?? datedMembers[0]?.careerStartYear
  const memberYearGroups = Array.from(
    new Set(datedMembers.map((m) => m.careerStartYear as number))
  ).map((year) => ({
    year,
    names: datedMembers.filter((m) => m.careerStartYear === year).map((m) => m.name),
  }))
  const hasUnverifiedCareerStart =
    comedian.careerStartYearStatus === "secondary_source" ||
    comedian.careerStartYearStatus === "estimated" ||
    (comedian.careerStartYear === null && datedMembers.length > 0)

  const facts: { label: string; value: string }[] = [
    ...(isGroup
      ? [{ label: "結成", value: comedian.formationYear ? `${comedian.formationYear}年` : "不明" }]
      : []),
    { label: "所属", value: comedian.agency ?? "不明" },
    { label: "養成所", value: formatSchool(comedian) },
    ...(comedian.schoolEquivalent
      ? [{ label: "養成所の期相当", value: comedian.schoolEquivalent }]
      : []),
  ]

  return (
    <div>
      {/* ヘッダー */}
      <section className="bg-washi border-b border-line">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <Link href="/timeline" className="text-xs text-muted hover:text-shu">
              ← タイムライン
            </Link>
            <div className="mt-4 flex items-center gap-2">
              <KindBadge comedian={comedian} />
            </div>
            <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
              {comedian.name}
            </h1>
            {comedian.nameKana && (
              <p className="mt-2 text-sm tracking-widest text-muted">{comedian.nameKana}</p>
            )}
          </div>

          <div className="w-full rounded-3xl border-2 border-ink bg-card p-6 shadow-[6px_6px_0_0_var(--color-ink)] md:w-72">
            <p className="text-xs font-bold text-muted">芸歴開始</p>
            {comedian.careerStartYear !== null ? (
              <>
                <p className="mt-1 font-display text-5xl text-shu">
                  {comedian.careerStartYear}
                  <span className="ml-1 font-sans text-base font-bold text-ink">年</span>
                </p>
                <p className="mt-2 text-sm font-bold">
                  芸歴 {getCareerYears(comedian.careerStartYear)} 年目
                  <span className="ml-1 text-xs font-normal text-muted">（目安）</span>
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge status={comedian.careerStartYearStatus} />
                  {comedian.careerStartBasis && (
                    <span className="text-xs text-muted">
                      基準：{CAREER_START_BASIS_LABELS[comedian.careerStartBasis]}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="mt-2 font-display text-xl">
                  {getNullCareerStartReason(comedian) === "mixed"
                    ? "メンバーにより異なる"
                    : "不明"}
                </p>
                {isGroup && (
                  <p className="mt-3 text-xs leading-relaxed text-muted">
                    {getNullCareerStartReason(comedian) === "mixed"
                      ? "メンバーごとに芸歴開始年が異なるため、グループとしての芸歴開始年は設定していません。"
                      : "芸歴開始年が確認できていないメンバーがいるため、グループとしての芸歴開始年は設定していません。"}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-14 px-4 pt-10">
        {/* 基本情報 */}
        <section>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label} className="rounded-2xl border border-line bg-card px-4 py-3">
                <dt className="text-[11px] font-bold text-muted">{fact.label}</dt>
                <dd className="mt-1 font-bold">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* メンバー */}
        {(currentMembers.length > 0 || formerMembers.length > 0) && (
          <section>
            <SectionHeading title="メンバー" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {currentMembers.map((m) => (
                <MemberCard
                  key={m.id ?? m.name}
                  member={m}
                  showSchool={Boolean(m.school) || !comedian.school}
                  showEquivalent={Boolean(m.schoolEquivalent) && !comedian.schoolEquivalent}
                />
              ))}
            </div>
            {formerMembers.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-bold text-muted">元メンバー</h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {formerMembers.map((m) => (
                    <li
                      key={m.id ?? m.name}
                      className="rounded-full border border-dashed border-ink/25 px-3 py-1.5 text-sm text-ink-soft"
                    >
                      {formatFormerMember(m)}
                      <span className="ml-2 text-xs text-muted">
                        芸歴開始 {formatMemberCareerStartYear(m)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* 芸歴上の位置 */}
        <section>
          <SectionHeading title="芸歴上の位置" note="芸歴開始年が前後2年以内の芸人" />
          <div className="mt-5">
            {comedian.careerStartYear !== null ? (
              <CareerPosition year={comedian.careerStartYear} excludeId={comedian.id} />
            ) : memberYearGroups.length > 0 ? (
              <div className="space-y-12">
                {memberYearGroups.map((group) => (
                  <div key={group.year}>
                    <h3 className="mb-4 inline-flex flex-wrap items-center gap-x-2 rounded-2xl bg-ink px-4 py-1.5 text-sm font-bold text-paper">
                      {group.names.join("・")}
                      <span className="font-display text-kin">{group.year}</span>
                      を基準にした場合
                    </h3>
                    <CareerPosition year={group.year} excludeId={comedian.id} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
                芸歴開始年が不明なため表示できません。
              </p>
            )}

            {comedian.careerStartYear === null &&
              currentMembers.some((m) => m.careerStartYear == null) && (
                <p className="mt-4 text-xs text-muted">
                  ※
                  {currentMembers
                    .filter((m) => m.careerStartYear == null)
                    .map((m) => m.name)
                    .join("、")}
                  は芸歴開始年が不明のため表示していません。
                </p>
              )}
          </div>
        </section>

        {/* 操作 */}
        <section className="flex flex-wrap gap-3">
          <Link
            href={timelineYear ? `/timeline#year-${timelineYear}` : "/timeline#year-unknown"}
            className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-card px-5 py-2.5 text-sm font-bold transition-colors hover:bg-ink hover:text-paper"
          >
            タイムラインで見る
          </Link>
          <Link
            href={`/compare?first=${comedian.slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-shu px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-shu-deep"
          >
            別の芸人と比較する <span aria-hidden="true">→</span>
          </Link>
        </section>

        {/* 出典 */}
        <section className="rounded-3xl border border-line bg-paper-deep/60 p-6">
          <h2 className="text-sm font-bold">出典・芸歴の定義</h2>
          {comedian.sources.length === 0 ? (
            <p className="mt-3 text-xs text-muted">出典は未登録です。</p>
          ) : (
            <ul className="mt-3 space-y-1.5 text-xs text-ink-soft">
              {comedian.sources.map((source, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden="true" className="text-shu">●</span>
                  <span>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-line underline-offset-2 hover:text-shu"
                    >
                      {source.title}
                    </a>
                    {source.checkedAt && (
                      <span className="text-muted">（参照日: {source.checkedAt}）</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {hasUnverifiedCareerStart && (
            <p className="mt-4 text-xs leading-relaxed text-muted">
              芸歴開始年は二次情報源の値で、公式情報による確認は済んでいません。
            </p>
          )}
          <p className="mt-2 text-xs leading-relaxed text-muted">
            本サイトの芸歴の前後関係は芸歴開始年の差を示す独自の目安です。
            実際の芸能界上の先輩後輩関係を断定するものではありません。
          </p>
        </section>
      </div>
    </div>
  )
}

function SectionHeading({ title, note }: { title: string; note?: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b-2 border-ink pb-2">
      <h2 className="font-display text-2xl">{title}</h2>
      {note && <span className="text-xs text-muted">{note}</span>}
    </div>
  )
}

function MemberCard({
  member,
  showSchool,
  showEquivalent,
}: {
  member: Member
  showSchool: boolean
  showEquivalent: boolean
}) {
  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="font-bold">{member.name}</span>
        <span className="font-display text-xl text-shu">
          {member.careerStartYear ?? "—"}
        </span>
      </div>
      <div className="mt-2 space-y-0.5 text-xs text-muted">
        <p>
          芸歴開始 {formatMemberCareerStartYear(member)}
          {member.careerStartYear != null &&
            member.careerStartBasis &&
            member.careerStartBasis !== "unknown" &&
            `（${CAREER_START_BASIS_LABELS[member.careerStartBasis]}）`}
        </p>
        {showSchool && <p>養成所 {formatMemberSchool(member)}</p>}
        {showEquivalent && <p>{member.schoolEquivalent}相当</p>}
      </div>
      {member.id && (
        <Link
          href={`/compare?first=${member.id}`}
          className="mt-3 inline-flex text-xs font-bold text-shu hover:underline"
        >
          この人で比較 →
        </Link>
      )}
    </div>
  )
}

function LegacyRedirect({ to, name }: { to: string; name: string }) {
  const href = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${to}`
  return (
    <div className="mx-auto max-w-5xl px-4 py-24 text-center">
      <meta httpEquiv="refresh" content={`0;url=${href}`} />
      <p className="text-sm text-muted">このページは移動しました。</p>
      <Link href={to} className="mt-4 inline-block font-bold text-shu underline">
        {name}のページへ
      </Link>
    </div>
  )
}
