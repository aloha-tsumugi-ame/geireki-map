import { getYearEntriesByYear } from "@/lib/careerStart"

// 芸歴開始年が同じ芸人。
// 養成所の同期など根拠のある「同期」とは区別する（docs/data-policy.md）。
export function getSameCareerStartYear(year: number, excludeId: string) {
  return getYearEntriesByYear(year, excludeId)
}
