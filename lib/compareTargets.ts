import { comedians } from "@/data/comedians"
import type {
  CareerStartBasis,
  CareerStartYearStatus,
  Comedian,
  Member,
} from "@/types/comedian"
import { normalizeSearchText } from "@/lib/normalizeSearchText"
import { isCurrentMember } from "@/lib/members"

// 比較の対象。グループ・ピン芸人（entry）と、グループのメンバー個人（member）のどちらも選べる。
// URL の値（key）は entry なら slug、member なら person id（例: person-0049）。
// validation で member id と slug が衝突しないことを保証している。
export type CompareTarget = {
  key: string
  kind: "entry" | "member"
  comedian: Comedian
  member?: Member
  name: string
  careerStartYear: number | null
  careerStartYearStatus?: CareerStartYearStatus
  careerStartBasis?: CareerStartBasis
}

function entryTarget(comedian: Comedian): CompareTarget {
  return {
    key: comedian.slug,
    kind: "entry",
    comedian,
    name: comedian.name,
    careerStartYear: comedian.careerStartYear,
    careerStartYearStatus: comedian.careerStartYearStatus,
    careerStartBasis: comedian.careerStartBasis,
  }
}

function memberTarget(comedian: Comedian, member: Member): CompareTarget {
  return {
    key: member.id as string,
    kind: "member",
    comedian,
    member,
    name: member.name,
    careerStartYear: member.careerStartYear ?? null,
    careerStartYearStatus: member.careerStartYearStatus,
    careerStartBasis: member.careerStartBasis,
  }
}

// グループのメンバー（id のあるもの）。現在メンバーを先、元メンバーを後に並べる
function membersOf(comedian: Comedian) {
  const members = (comedian.members ?? []).filter((m) => m.id)
  return [...members.filter(isCurrentMember), ...members.filter((m) => !isCurrentMember(m))]
}

export function getCompareTarget(key: string | undefined): CompareTarget | undefined {
  if (!key) return undefined
  const comedian = comedians.find((c) => c.slug === key)
  if (comedian) return entryTarget(comedian)
  for (const c of comedians) {
    const member = c.members?.find((m) => m.id === key)
    if (member) return memberTarget(c, member)
  }
  return undefined
}

const normalizeAll = (values: (string | undefined)[]) =>
  values.filter((v): v is string => Boolean(v)).map(normalizeSearchText)

const index = comedians.map((comedian) => ({
  comedian,
  keys: normalizeAll([comedian.name, comedian.nameKana, ...(comedian.aliases ?? [])]),
  members: membersOf(comedian).map((member) => ({
    member,
    keys: normalizeAll([member.name, member.nameKana, ...(member.aliases ?? [])]),
  })),
}))

// 比較対象の候補。グループ名に一致したらグループとそのメンバー全員を、
// メンバー名に一致したらそのメンバーとグループを候補にする。
export function searchCompareTargets(keyword: string, limit = 12): CompareTarget[] {
  const q = normalizeSearchText(keyword)
  if (!q) return []

  const results: CompareTarget[] = []
  for (const item of index) {
    const entryHit = item.keys.some((k) => k.includes(q))
    const memberHits = item.members.filter((m) => m.keys.some((k) => k.includes(q)))
    if (entryHit) {
      results.push(entryTarget(item.comedian))
      results.push(...item.members.map((m) => memberTarget(item.comedian, m.member)))
    } else if (memberHits.length > 0) {
      results.push(...memberHits.map((m) => memberTarget(item.comedian, m.member)))
      results.push(entryTarget(item.comedian))
    }
  }
  return results.slice(0, limit)
}

// 「千鳥のメンバー」「東京ダイナマイトの元メンバー」
export function describeMemberTarget(target: CompareTarget) {
  if (target.kind !== "member" || !target.member) return null
  return isCurrentMember(target.member)
    ? `${target.comedian.name}のメンバー`
    : `${target.comedian.name}の元メンバー`
}

// プルダウン用の全候補。グループ・ピン芸人を名前順に並べ、グループの直後にそのメンバーを続ける
const allTargets: CompareTarget[] = [...comedians]
  .sort((a, b) => a.name.localeCompare(b.name, "ja"))
  .flatMap((c) => [entryTarget(c), ...membersOf(c).map((m) => memberTarget(c, m))])

export function listCompareTargets() {
  return allTargets
}
