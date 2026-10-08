// seed JSON と、そこから生成される芸人データを検証するスクリプト。
// 使い方: `npm run data:validate`（全件表示は `npm run data:validate -- --verbose`）
//
// ERROR   … データとして壊れている。修正が必要（終了コード 1）
// WARNING … 公開前に確認・補強したほうがよい箇所
//
// metadata.legacyRecords の範囲内の id はレガシーレコード。新規レコード向けの必須ルール（明示slug等）を免除し、
// WARNING は件数のみ表示する。
//
// data/comedians.ts が seed から再生成した内容と一致しない場合（手編集・再生成忘れ）も ERROR とする。

import { readFileSync } from "node:fs"
import {
  buildComedians,
  createLegacyChecker,
  createReport,
  hasErrors,
  loadSeed,
  outPath,
  printReport,
  renderComediansTs,
  validateComedians,
  validateSeed,
} from "./lib/comedian-data.mjs"

const verbose = process.argv.includes("--verbose")

const seed = loadSeed()
const report = createReport()

validateSeed(seed, report)
const entries = buildComedians(seed)
validateComedians(entries, report, seed.metadata)

const current = readFileSync(outPath, "utf8")
if (current !== renderComediansTs(entries, seed.metadata)) {
  report.error(
    "generated-file-stale",
    "data/comedians.ts が seed JSON から生成した内容と一致しない（npm run data:import を実行してください）"
  )
}

const groups = entries.filter((c) => c.members)
const isLegacy = createLegacyChecker(seed.metadata)
const legacyCount = entries.filter((c) => isLegacy(c.id)).length
const statusCounts = Object.entries(
  entries.reduce((acc, c) => ({ ...acc, [c.status]: (acc[c.status] ?? 0) + 1 }), {})
)
  .map(([status, n]) => `${status} ${n}`)
  .join(" / ")
console.log("SUMMARY")
console.log(`  seed: people ${seed.people.length} / groups ${seed.groups.length}`)
console.log(`  schemaVersion: ${seed.metadata.schemaVersion}`)
console.log(`  comedians: ${entries.length}（グループ ${groups.length} / ピン ${entries.length - groups.length}）`)
console.log(`  レガシー ${legacyCount} / 新規 ${entries.length - legacyCount}`)
console.log(`  status: ${statusCounts}`)
console.log(`  careerStartYear が null: ${entries.filter((c) => c.careerStartYear === null).length}`)
console.log(`  mixedMemberCareerStartYears: true ${groups.filter((c) => c.mixedMemberCareerStartYears === true).length} / null（一部不明） ${groups.filter((c) => c.mixedMemberCareerStartYears === null).length}`)
const basisCounts = {}
for (const c of entries) {
  for (const p of c.members ?? [c]) basisCounts[p.careerStartBasis] = (basisCounts[p.careerStartBasis] ?? 0) + 1
}
console.log(`  careerStartBasis（個人単位）: ${Object.entries(basisCounts).map(([b, n]) => `${b} ${n}`).join(" / ")}`)
console.log(`  formationYear 設定済み: ${groups.filter((c) => c.formationYear != null).length} / ${groups.length}`)
console.log(`  agency 設定済み: ${entries.filter((c) => c.agency != null).length} / ${entries.length}`)

printReport(report, { verbose })

if (hasErrors(report)) {
  process.exit(1)
}
