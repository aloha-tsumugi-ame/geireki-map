import type { Comedian, Member } from "@/types/comedian"

function schoolLabel(school?: string | null, generation?: number | null) {
  if (!school) return null
  return generation != null ? `${school}${generation}期` : school
}

export function formatMemberSchool(member: Member) {
  return schoolLabel(member.school, member.schoolGeneration) ?? "不明"
}

// グループでメンバー間の養成所が異なる場合は「メンバーにより異なる」。
// 値が無い場合は「該当なし」と断定せず「不明」とする。
export function formatSchool(comedian: Comedian) {
  const label = schoolLabel(comedian.school, comedian.schoolGeneration)
  if (label) return label
  if (comedian.members?.some((m) => m.school)) return "メンバーにより異なる"
  return "不明"
}
