import type { CareerStartYearStatus, Comedian } from "@/types/comedian"
import { getCurrentMembers } from "@/lib/members"

// 表示用の補助。データの値そのものは変更しない。

// 「ピン」「コンビ」「トリオ」「グループ」（現在メンバーの人数から。2人未満なら元メンバーも含めた人数）
export function getKindLabel(comedian: Comedian) {
  if (!comedian.members) return "ピン"
  const current = getCurrentMembers(comedian).length
  const count = current >= 2 ? current : comedian.members.length
  if (count === 2) return "コンビ"
  if (count === 3) return "トリオ"
  return "グループ"
}

// 芸歴開始年を1年目として数えた目安（ビルド時点の年を基準にする）
export function getCareerYears(careerStartYear: number) {
  return new Date().getFullYear() - careerStartYear + 1
}

export const STATUS_TONE: Record<CareerStartYearStatus, string> = {
  confirmed: "bg-matsu-soft text-matsu",
  secondary_source: "bg-kin-soft text-[#8a5a00]",
  estimated: "bg-kin-soft text-[#8a5a00]",
  unknown: "bg-paper-deep text-muted",
}
