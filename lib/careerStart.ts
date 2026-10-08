import { comedians } from "@/data/comedians"
import type {
  CareerStartBasis,
  CareerStartYearStatus,
  Comedian,
  Member,
} from "@/types/comedian"

// 芸歴開始年 = プロの芸人としてのキャリアが始まった年（docs/data-policy.md「芸歴の定義」）

export const CAREER_START_BASIS_LABELS: Record<CareerStartBasis, string> = {
  school_graduation: "養成所卒業後のプロ活動開始",
  apprenticeship: "弟子入り・入門",
  professional_debut: "プロデビュー",
  first_stage: "初舞台",
  professional_activity: "プロとしての活動開始",
  indie_activity: "事務所所属前の芸人活動",
  secondary_source_editorial: "二次情報源の芸歴年",
  unknown: "不明",
}

export const CAREER_START_YEAR_STATUS_LABELS: Record<CareerStartYearStatus, string> = {
  confirmed: "確認済み",
  secondary_source: "二次情報源の値・未確認",
  estimated: "推定値",
  unknown: "不明",
}

// careerStartYear が null の理由。グループでメンバー間の年が異なる場合は "mixed"。
export function getNullCareerStartReason(comedian: Comedian): "mixed" | "unknown" {
  return comedian.mixedMemberCareerStartYears === true ? "mixed" : "unknown"
}

// 「1994年」「メンバーにより異なる」「不明」
export function formatCareerStartYear(comedian: Comedian) {
  if (comedian.careerStartYear !== null) return `${comedian.careerStartYear}年`
  return getNullCareerStartReason(comedian) === "mixed" ? "メンバーにより異なる" : "不明"
}

export function formatMemberCareerStartYear(member: Member) {
  return member.careerStartYear != null ? `${member.careerStartYear}年` : "不明"
}

// 芸歴開始年ごとの一覧・前後の芸人・芸歴開始年が同じ芸人で使う単位。
// careerStartYear を持つ芸人はそのまま1件、careerStartYear が null のグループは
// 芸歴開始年が判明しているメンバーごとに1件（グループへのリンク）として扱う。
export type YearEntry = {
  comedian: Comedian
  member?: Member
  year: number
}

const yearEntries: YearEntry[] = comedians.flatMap((comedian): YearEntry[] => {
  if (comedian.careerStartYear !== null) {
    return [{ comedian, year: comedian.careerStartYear }]
  }
  return (comedian.members ?? []).flatMap((member) =>
    member.careerStartYear != null
      ? [{ comedian, member, year: member.careerStartYear }]
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
