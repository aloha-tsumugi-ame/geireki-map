// data/geireki-matome.seed.json を data/comedians.ts に変換するスクリプト。
// シードJSONを更新したら `npm run data:import` を再実行する。
//
// 方針（詳細は docs/data-policy.md）:
// - seed JSON が唯一の元データ。comedians.ts は生成物なので直接編集しない。
// - careerStartYear（芸歴開始年 = プロの芸人としてのキャリアが始まった年）は people[] の個人単位の値が正。
//   groups[] はその集約。
// - グループはメンバーの芸歴開始年が一致するかに関係なく、常に1つの Comedian として生成する。
//   メンバー全員の年が判明かつ一致する場合のみ group.careerStartYear にその年を入れ、
//   異なる・一部不明の場合は null とする（最古メンバーの年を自動採用しない）。
//   個人の年は members[].careerStartYear に残す。
// - careerStartBasis（芸歴開始年の根拠）は推定しない。seed に明示が無ければ unknown。
// - careerStartYearStatus は seed に明示が無ければ、年があれば secondary_source / 無ければ unknown（自動で confirmed にしない）。
// - status は seed に明示が無ければ unknown（確認していない活動状況を active にしない）。
// - グループの verificationStatus はグループ自体の情報の確認状況。メンバーの値からは導出しない。
// - メンバーの verificationStatus / sources は people[] の値をそのまま Member に引き継ぐ。
// - seed に存在しない値は補わない（formationYear, agency, nameKana, aliases は seed にあれば出力）。
// - 検証で ERROR が出た場合は comedians.ts を書き出さない。

import { writeFileSync } from "node:fs"
import path from "node:path"
import {
  buildComedians,
  createReport,
  hasErrors,
  loadSeed,
  outPath,
  printReport,
  renderComediansTs,
  validateComedians,
  validateSeed,
} from "./lib/comedian-data.mjs"

const seed = loadSeed()
const report = createReport()

validateSeed(seed, report)
const entries = buildComedians(seed)
validateComedians(entries, report, seed.metadata)

if (hasErrors(report)) {
  printReport(report)
  console.error("\nERROR があるため comedians.ts を書き出しませんでした。")
  process.exit(1)
}

writeFileSync(outPath, renderComediansTs(entries, seed.metadata))

const warnings = report.issues.filter((i) => i.level === "WARNING").length
console.log(
  `Wrote ${entries.length} comedians to ${path.relative(process.cwd(), outPath)}` +
    `（WARNING ${warnings}件。詳細は npm run data:validate）`
)
