import { comedians } from "@/data/comedians"
import type {
  Comedian,
  DebutType,
  DebutYearStatus,
  Member,
} from "@/types/comedian"

export const DEBUT_TYPE_LABELS: Record<DebutType, string> = {
  first_stage: "初舞台",
  professional_activity: "芸人としての活動開始",
  agency_entry: "事務所所属",
  school_graduation: "養成所卒業",
  apprenticeship: "弟子入り",
  indie_start: "インディーズでの活動開始",
  secondary_source_editorial: "二次情報源の編集上の芸歴年",
  unknown: "基準不明",
}

export const DEBUT_YEAR_STATUS_LABELS: Record<DebutYearStatus, string> = {
  confirmed: "確認済み",
  secondary_source: "二次情報源の値・未確認",
  estimated: "推定値",
  unknown: "不明",
}

// debutYear が null の理由。グループでメンバー間の年が異なる場合は "mixed"。
export function getNullDebutReason(comedian: Comedian): "mixed" | "unknown" {
  return comedian.mixedMemberDebutYears === true ? "mixed" : "unknown"
}

// 「1994年」「メンバーにより異なる」「不明」
export function formatDebutYear(comedian: Comedian) {
  if (comedian.debutYear !== null) return `${comedian.debutYear}年`
  return getNullDebutReason(comedian) === "mixed" ? "メンバーにより異なる" : "不明"
}

export function formatMemberDebutYear(member: Member) {
  return member.debutYear != null ? `${member.debutYear}年` : "不明"
}

// 芸歴開始年ごとの一覧・前後の芸人・同年デビューで使う単位。
// debutYear を持つ芸人はそのまま1件、debutYear が null のグループは
// 芸歴開始年が判明しているメンバーごとに1件（グループへのリンク）として扱う。
export type YearEntry = {
  comedian: Comedian
  member?: Member
  year: number
}

const yearEntries: YearEntry[] = comedians.flatMap((comedian): YearEntry[] => {
  if (comedian.debutYear !== null) {
    return [{ comedian, year: comedian.debutYear }]
  }
  return (comedian.members ?? []).flatMap((member) =>
    member.debutYear != null
      ? [{ comedian, member, year: member.debutYear }]
      : []
  )
})

export function getYearEntries() {
  return yearEntries
}

export function getYearEntriesByYear(year: number, excludeId?: string) {
  return yearEntries.filter(
    (entry) => entry.year === year && entry.comedian.id !== excludeId
  )
}

// 芸歴開始年が判明しているメンバーもいないため、年別の一覧に載らない芸人
export function getUndatedComedians() {
  const dated = new Set(yearEntries.map((entry) => entry.comedian.id))
  return comedians.filter((comedian) => !dated.has(comedian.id))
}

export function yearEntryKey(entry: YearEntry) {
  return entry.member ? `${entry.comedian.id}:${entry.member.name}` : entry.comedian.id
}
