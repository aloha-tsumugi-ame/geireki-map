import { getYearEntriesByYear } from "@/lib/debut"

// 芸歴開始年が同じ芸人（同年デビュー）。
// 養成所の同期など根拠のある「同期」とは区別する（docs/data-policy.md）。
export function getSameYearDebut(year: number, excludeId: string) {
  return getYearEntriesByYear(year, excludeId)
}
