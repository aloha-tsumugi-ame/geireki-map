import { getNullCareerStartReason } from "@/lib/careerStart"
import type { CompareTarget } from "@/lib/compareTargets"

function notComparableReason(target: CompareTarget) {
  if (target.kind === "member") {
    return `${target.name}は芸歴開始年が不明なため、芸歴を比較できません。`
  }
  const comedian = target.comedian
  if (getNullCareerStartReason(comedian) === "mixed") {
    return `${comedian.name}はメンバーごとに芸歴開始年が異なるため、グループ単位では芸歴を比較できません。メンバー個人を選ぶと比較できます。`
  }
  return comedian.members
    ? `${comedian.name}は芸歴開始年が確認できていないメンバーがいるため、グループ単位では芸歴を比較できません。`
    : `${comedian.name}は芸歴開始年が不明なため、芸歴を比較できません。`
}

// 芸歴開始年の差を「芸歴上、Aがn年先輩」と表す（芸歴開始年だけに基づく目安。実際の関係は断定しない）。
export function compareTargets(a: CompareTarget, b: CompareTarget) {
  if (a.key === b.key) {
    return "同じ芸人が選択されています"
  }

  if (a.careerStartYear === null || b.careerStartYear === null) {
    return [a, b]
      .filter((t) => t.careerStartYear === null)
      .map(notComparableReason)
      .join("")
  }

  const diff = b.careerStartYear - a.careerStartYear

  if (diff === 0) {
    return "芸歴開始年が同じです"
  }

  if (diff > 0) {
    return `芸歴上、${a.name}が${diff}年先輩です`
  }

  return `芸歴上、${b.name}が${Math.abs(diff)}年先輩です`
}
