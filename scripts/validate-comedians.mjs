// seed JSON と、そこから生成される芸人データを検証するスクリプト。
// 使い方: `npm run data:validate`（全件表示は `npm run data:validate -- --verbose`）
//
// ERROR   … データとして壊れている。修正が必要（終了コード 1）
// WARNING … 公開前に確認・補強したほうがよい箇所
//
// data/comedians.ts が seed から再生成した内容と一致しない場合（手編集・再生成忘れ）も ERROR とする。

import { readFileSync } from "node:fs"
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

const verbose = process.argv.includes("--verbose")

const seed = loadSeed()
const report = createReport()

validateSeed(seed, report)
const entries = buildComedians(seed)
validateComedians(entries, report)

const current = readFileSync(outPath, "utf8")
if (current !== renderComediansTs(entries, seed.metadata)) {
  report.error(
    "generated-file-stale",
    "data/comedians.ts が seed JSON から生成した内容と一致しない（npm run data:import を実行してください）"
  )
}

const groups = entries.filter((c) => c.members)
console.log("SUMMARY")
console.log(`  seed: people ${seed.people.length} / groups ${seed.groups.length}`)
console.log(`  comedians: ${entries.length}（グループ ${groups.length} / ピン ${entries.length - groups.length}）`)
console.log(`  debutYear が null: ${entries.filter((c) => c.debutYear === null).length}`)
console.log(`  mixedMemberDebutYears: true ${groups.filter((c) => c.mixedMemberDebutYears === true).length} / null（一部不明） ${groups.filter((c) => c.mixedMemberDebutYears === null).length}`)
console.log(`  formationYear 設定済み: ${groups.filter((c) => c.formationYear != null).length} / ${groups.length}`)
console.log(`  agency 設定済み: ${entries.filter((c) => c.agency != null).length} / ${entries.length}`)

printReport(report, { verbose })

if (hasErrors(report)) {
  process.exit(1)
}
