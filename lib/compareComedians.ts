import type { Comedian } from "@/types/comedian"
import { getNullDebutReason } from "@/lib/debut"

function notComparableReason(comedian: Comedian) {
  if (getNullDebutReason(comedian) === "mixed") {
    return `${comedian.name}はメンバーごとに芸歴開始年が異なるため、グループ単位では芸歴を比較できません。`
  }
  return comedian.members
    ? `${comedian.name}は一部メンバーの芸歴開始年が不明なため、グループ単位では芸歴を比較できません。`
    : `${comedian.name}は芸歴開始年が不明なため、芸歴を比較できません。`
}

// 芸歴開始年の差のみを示す。「先輩・後輩」とは断定しない。
export function compareComedians(a: Comedian, b: Comedian) {
  if (a.id === b.id) {
    return "同じ芸人が選択されています"
  }

  if (a.debutYear === null || b.debutYear === null) {
    return [a, b]
      .filter((c) => c.debutYear === null)
      .map(notComparableReason)
      .join("")
  }

  const diff = b.debutYear - a.debutYear

  if (diff === 0) {
    return "芸歴開始年が同じです（同年デビュー）"
  }

  if (diff > 0) {
    return `芸歴上、${a.name}が${diff}年先です`
  }

  return `芸歴上、${b.name}が${Math.abs(diff)}年先です`
}
