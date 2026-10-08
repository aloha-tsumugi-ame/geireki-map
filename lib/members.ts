import type { Comedian, Member } from "@/types/comedian"

// membershipStatus が未指定のメンバーは現在メンバーとして扱う
export function isCurrentMember(member: Member) {
  return member.membershipStatus !== "former"
}

export function getCurrentMembers(comedian: Comedian) {
  return (comedian.members ?? []).filter(isCurrentMember)
}

export function getFormerMembers(comedian: Comedian) {
  return (comedian.members ?? []).filter((member) => !isCurrentMember(member))
}

// 「松田大輔（2026年脱退）」
export function formatFormerMember(member: Member) {
  return member.leftYear != null
    ? `${member.name}（${member.leftYear}年脱退）`
    : `${member.name}（元メンバー）`
}
