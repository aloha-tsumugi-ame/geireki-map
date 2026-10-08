// seed JSON → Comedian[] の変換と、seed / 生成結果の検証。
// import-comedians.mjs と validate-comedians.mjs の両方から使う。
// データの意味・運用ルールは docs/data-policy.md を参照。

import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const seedPath = path.join(__dirname, "../../data/geireki-matome.seed.json")
export const outPath = path.join(__dirname, "../../data/comedians.ts")

export function loadSeed() {
  return JSON.parse(readFileSync(seedPath, "utf8"))
}

// ---------------------------------------------------------------------------
// 列挙値
// ---------------------------------------------------------------------------

export const VERIFICATION_STATUSES = [
  "candidate_unverified",
  "extracted_secondary",
  "official_single_source",
  "verified_multi_source",
  "conflict_needs_review",
  "manual_verified",
]

// seed 初版で使っていた値 → 現行の値
const LEGACY_VERIFICATION_STATUS = {
  unverified_secondary_source: "extracted_secondary",
}

// グループの verificationStatus はメンバー中で最も弱いものを採用する
const VERIFICATION_RANK = {
  conflict_needs_review: 0,
  candidate_unverified: 1,
  extracted_secondary: 2,
  official_single_source: 3,
  verified_multi_source: 4,
  manual_verified: 5,
}

export const DEBUT_YEAR_STATUSES = ["confirmed", "secondary_source", "estimated", "unknown"]

export const DEBUT_TYPES = [
  "first_stage",
  "professional_activity",
  "agency_entry",
  "school_graduation",
  "apprenticeship",
  "indie_start",
  "secondary_source_editorial",
  "unknown",
]

export const SOURCE_TYPES = [
  "agency_official",
  "school_official",
  "award_official",
  "secondary_database",
  "wikipedia",
  "news",
]

const PRIMARY_SOURCE_TYPES = new Set(["agency_official", "school_official", "award_official"])

export const STATUSES = ["active", "inactive", "disbanded"]

// 出典URLのホスト → 表示タイトル・種別。seed 側で title / type を指定した場合はそちらを優先する。
const SOURCE_HOSTS = {
  "geireki-matome.net": {
    title: "geireki-matome.net（二次情報源・要検証）",
    type: "secondary_database",
  },
  "ja.wikipedia.org": { title: "Wikipedia（二次情報源・要検証）", type: "wikipedia" },
  "profile.yoshimoto.co.jp": { title: "吉本興業 公式プロフィール", type: "agency_official" },
}

const SECONDARY_EDITORIAL_HOSTS = new Set(["geireki-matome.net"])

// ---------------------------------------------------------------------------
// 変換
// ---------------------------------------------------------------------------

function hostOf(url) {
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}

function normalizeVerificationStatus(value) {
  if (value == null) return undefined
  return LEGACY_VERIFICATION_STATUS[value] ?? value
}

function toSource(rawSource, checkedAt) {
  if (!rawSource?.url) return null
  const known = SOURCE_HOSTS[hostOf(rawSource.url)] ?? {}
  return {
    title: rawSource.title ?? known.title ?? hostOf(rawSource.url) ?? rawSource.url,
    url: rawSource.url,
    checkedAt: rawSource.checkedAt ?? checkedAt,
    type: SOURCE_TYPES.includes(rawSource.type) ? rawSource.type : known.type,
    fields: rawSource.fields,
  }
}

function uniqueSources(sources) {
  const seen = new Set()
  return sources.filter((source) => {
    if (!source || seen.has(source.url)) return false
    seen.add(source.url)
    return true
  })
}

// seed の schoolEquivalent は { school, generation, relation } 形式
function formatSchoolEquivalent(value) {
  if (!value) return null
  if (typeof value === "string") return value
  const base = `${value.school ?? ""}${value.generation != null ? `${value.generation}期` : ""}`
  return value.relation ? `${base}（${value.relation}）` : base
}

// 根拠がない限り debutType は推定しない。
// geireki-matome.net 由来の年は同サイトの編集上の芸歴年なので secondary_source_editorial とする。
function personDebutType(person) {
  if (person.debutType) return person.debutType
  if (person.debutYear == null) return "unknown"
  if (SECONDARY_EDITORIAL_HOSTS.has(hostOf(person.source?.url))) {
    return "secondary_source_editorial"
  }
  return "unknown"
}

function personDebutYearStatus(person, verificationStatus) {
  if (person.debutYearStatus) return person.debutYearStatus
  if (person.debutYear == null) return "unknown"
  if (verificationStatus === "verified_multi_source" || verificationStatus === "manual_verified") {
    return "confirmed"
  }
  return "secondary_source"
}

function allSame(values) {
  return new Set(values.map((v) => JSON.stringify(v ?? null))).size === 1
}

// メンバーの芸歴開始年から、グループの debutYear と mixed 判定を求める。
// 全員が判明かつ一致 → その年 / 異なる → null (mixed: true) / 一部不明 → null (mixed: null)
export function deriveGroupDebut(memberYears) {
  const known = memberYears.filter((y) => y != null)
  const distinct = new Set(known)
  if (distinct.size > 1) return { debutYear: null, mixed: true }
  if (known.length === memberYears.length && distinct.size === 1) {
    return { debutYear: known[0], mixed: false }
  }
  return { debutYear: null, mixed: null }
}

// seed の任意項目（将来追加用）。存在する場合のみそのまま出力する。
function optionalFields(record) {
  return {
    nameKana: record.nameKana ?? undefined,
    aliases: record.aliases?.length ? record.aliases : undefined,
  }
}

function buildPersonFields(person, checkedAt) {
  const verificationStatus = normalizeVerificationStatus(person.verificationStatus)
  return {
    verificationStatus,
    debutYearStatus: personDebutYearStatus(person, verificationStatus),
    debutType: personDebutType(person),
    source: toSource(person.source, checkedAt),
  }
}

export function buildComedians(seed) {
  const { people, groups, metadata } = seed
  const checkedAt = metadata.createdAt
  const entries = []

  // 1. グループ：メンバーの芸歴開始年が一致するかに関係なく、常に1エントリにまとめる
  for (const g of groups) {
    const members = g.members
      .map((name) => people.find((p) => p.name === name && p.group === g.name))
      .filter(Boolean)
    const derived = members.map((m) => ({ person: m, ...buildPersonFields(m, checkedAt) }))

    const { debutYear, mixed } = deriveGroupDebut(members.map((m) => m.debutYear ?? null))

    const schoolKeys = members.map((m) => [m.school ?? null, m.schoolGeneration ?? null])
    const sameSchool = allSame(schoolKeys)
    const equivalents = members.map((m) => formatSchoolEquivalent(m.schoolEquivalent))
    const sameEquivalent = allSame(equivalents)

    const verificationStatus = derived
      .map((d) => d.verificationStatus)
      .filter(Boolean)
      .sort((a, b) => (VERIFICATION_RANK[a] ?? 0) - (VERIFICATION_RANK[b] ?? 0))[0]

    let debutYearStatus = "unknown"
    let debutType
    if (debutYear != null) {
      const statuses = derived.map((d) => d.debutYearStatus)
      debutYearStatus = statuses.every((s) => s === "confirmed")
        ? "confirmed"
        : statuses.includes("estimated")
          ? "estimated"
          : "secondary_source"
      const types = derived.map((d) => d.debutType)
      debutType = allSame(types) ? types[0] : "unknown"
    }

    entries.push({
      id: g.id,
      slug: g.slug ?? g.id,
      name: g.name,
      ...optionalFields(g),
      debutYear,
      debutYearStatus,
      debutType,
      formationYear: g.formationYear,
      agency: g.agency,
      school: sameSchool ? schoolKeys[0][0] : null,
      schoolGeneration: sameSchool ? schoolKeys[0][1] : null,
      schoolEquivalent: sameEquivalent ? equivalents[0] : null,
      members: members.map((m) => ({
        id: m.id,
        name: m.name,
        nameKana: m.nameKana ?? undefined,
        birthDate: m.birthDate ?? null,
        debutYear: m.debutYear ?? null,
        school: m.school ?? null,
        schoolGeneration: m.schoolGeneration ?? null,
        schoolEquivalent: formatSchoolEquivalent(m.schoolEquivalent),
      })),
      mixedMemberDebutYears: mixed,
      status: g.status ?? "active",
      verificationStatus,
      sources: uniqueSources(derived.map((d) => d.source)),
    })
  }

  // 2. どの組にも属さない個人（ピン芸人）
  for (const person of people.filter((p) => !p.group)) {
    const fields = buildPersonFields(person, checkedAt)
    entries.push({
      id: person.id,
      slug: person.slug ?? person.id,
      name: person.name,
      ...optionalFields(person),
      debutYear: person.debutYear ?? null,
      debutYearStatus: fields.debutYearStatus,
      debutType: fields.debutType,
      agency: person.agency,
      birthDate: person.birthDate ?? null,
      school: person.school ?? null,
      schoolGeneration: person.schoolGeneration ?? null,
      schoolEquivalent: formatSchoolEquivalent(person.schoolEquivalent),
      status: person.status ?? "active",
      verificationStatus: fields.verificationStatus,
      sources: fields.source ? [fields.source] : [],
    })
  }

  // 並び順：芸歴開始年（グループで null の場合はメンバー中の最も早い年）→ 名前
  const sortYear = (c) =>
    c.debutYear ??
    Math.min(...(c.members ?? []).map((m) => m.debutYear ?? Infinity), Infinity)
  entries.sort((a, b) => sortYear(a) - sortYear(b) || a.name.localeCompare(b.name, "ja"))

  return entries
}

// ---------------------------------------------------------------------------
// 検証
// ---------------------------------------------------------------------------

export function createReport() {
  const issues = []
  return {
    issues,
    error(code, message) {
      issues.push({ level: "ERROR", code, message })
    },
    warn(code, message) {
      issues.push({ level: "WARNING", code, message })
    },
  }
}

const MIN_YEAR = 1900
const isValidYear = (y) =>
  Number.isInteger(y) && y >= MIN_YEAR && y <= new Date().getFullYear()

function findDuplicates(values) {
  const seen = new Set()
  const dups = new Set()
  for (const v of values) {
    if (seen.has(v)) dups.add(v)
    seen.add(v)
  }
  return [...dups]
}

export function validateSeed(seed, report) {
  const { people, groups } = seed

  for (const id of findDuplicates(people.map((p) => p.id))) {
    report.error("seed-person-id-duplicate", `person id が重複: ${id}`)
  }
  for (const id of findDuplicates(groups.map((g) => g.id))) {
    report.error("seed-group-id-duplicate", `group id が重複: ${id}`)
  }
  for (const name of findDuplicates(groups.map((g) => g.name))) {
    report.error("seed-group-name-duplicate", `group name が重複: ${name}`)
  }

  const groupNames = new Set(groups.map((g) => g.name))

  for (const p of people) {
    if (p.group && !groupNames.has(p.group)) {
      report.error("seed-unknown-group", `${p.name}（${p.id}）の group「${p.group}」が groups に存在しない`)
    }
    const status = normalizeVerificationStatus(p.verificationStatus)
    if (status && !VERIFICATION_STATUSES.includes(status)) {
      report.error("seed-invalid-verification-status", `${p.name}: verificationStatus が不正: ${p.verificationStatus}`)
    }
  }

  for (const g of groups) {
    const groupPeople = people.filter((p) => p.group === g.name)

    for (const name of g.members) {
      if (!groupPeople.some((p) => p.name === name)) {
        report.error("seed-member-not-found", `${g.name} のメンバー「${name}」が people に存在しない`)
      }
    }
    for (const p of groupPeople) {
      if (!g.members.includes(p.name)) {
        report.error("seed-member-not-listed", `${p.name} は group「${g.name}」所属だが groups.members に含まれていない`)
      }
    }

    // memberDebutYears / mixedMemberDebutYears は people と矛盾していないか
    if (g.memberDebutYears) {
      for (const name of g.members) {
        const person = groupPeople.find((p) => p.name === name)
        if (!person) continue
        const listed = g.memberDebutYears[name]
        if (listed === undefined) {
          report.error("seed-member-debut-missing", `${g.name}: memberDebutYears に ${name} がない`)
        } else if ((listed ?? null) !== (person.debutYear ?? null)) {
          report.error(
            "seed-member-debut-mismatch",
            `${g.name}: memberDebutYears[${name}]=${listed} と people.debutYear=${person.debutYear} が不一致`
          )
        }
      }
    }
    if (g.mixedMemberDebutYears !== undefined) {
      const { mixed } = deriveGroupDebut(groupPeople.map((p) => p.debutYear ?? null))
      if ((g.mixedMemberDebutYears ?? null) !== mixed) {
        report.error(
          "seed-mixed-flag-mismatch",
          `${g.name}: mixedMemberDebutYears=${g.mixedMemberDebutYears} だがメンバーの年から求めると ${mixed}`
        )
      }
    }
  }
}

export function validateComedians(entries, report) {
  const memberIds = entries.flatMap((c) => (c.members ?? []).map((m) => m.id).filter(Boolean))
  const slugs = new Set(entries.map((c) => c.slug))

  for (const id of findDuplicates(entries.map((c) => c.id))) {
    report.error("id-duplicate", `id が重複: ${id}`)
  }
  for (const slug of findDuplicates(entries.map((c) => c.slug))) {
    report.error("slug-duplicate", `slug が重複: ${slug}`)
  }
  for (const id of findDuplicates(memberIds)) {
    report.error("member-id-duplicate", `member id が重複: ${id}`)
  }
  for (const id of memberIds) {
    if (slugs.has(id)) {
      report.error("member-id-slug-collision", `member id ${id} が Comedian の slug と衝突（旧URLリダイレクトが曖昧になる）`)
    }
  }

  const comedianNames = new Set(entries.map((c) => c.name))
  const memberNameOwners = new Map()

  for (const c of entries) {
    const label = c.name || c.id

    if (!c.name?.trim()) report.error("name-missing", `${c.id}: name が空`)
    if (!c.slug?.trim()) report.error("slug-missing", `${c.id}: slug が空`)

    if (c.debutYear !== null && !isValidYear(c.debutYear)) {
      report.error("debut-year-invalid", `${label}: debutYear が異常値: ${c.debutYear}`)
    }
    if (c.formationYear != null && !isValidYear(c.formationYear)) {
      report.error("formation-year-invalid", `${label}: formationYear が異常値: ${c.formationYear}`)
    }
    if (c.debutYearStatus && !DEBUT_YEAR_STATUSES.includes(c.debutYearStatus)) {
      report.error("debut-year-status-invalid", `${label}: debutYearStatus が不正: ${c.debutYearStatus}`)
    }
    if (c.debutYear === null && c.debutYearStatus && c.debutYearStatus !== "unknown") {
      report.error("debut-year-status-mismatch", `${label}: debutYear が null なのに debutYearStatus=${c.debutYearStatus}`)
    }
    if (c.debutYear !== null && c.debutYearStatus === "unknown") {
      report.error("debut-year-status-mismatch", `${label}: debutYear=${c.debutYear} なのに debutYearStatus=unknown`)
    }
    if (c.debutType && !DEBUT_TYPES.includes(c.debutType)) {
      report.error("debut-type-invalid", `${label}: debutType が不正: ${c.debutType}`)
    }
    if (!STATUSES.includes(c.status)) {
      report.error("status-invalid", `${label}: status が不正: ${c.status}`)
    }
    if (c.verificationStatus && !VERIFICATION_STATUSES.includes(c.verificationStatus)) {
      report.error("verification-status-invalid", `${label}: verificationStatus が不正: ${c.verificationStatus}`)
    }
    if (c.birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(c.birthDate)) {
      report.error("birth-date-invalid", `${label}: birthDate の形式が不正: ${c.birthDate}`)
    }

    // 出典
    if (c.sources.length === 0) {
      report.warn("source-missing", `${label}: 出典が1件もない`)
    }
    for (const source of c.sources) {
      if (!source.url || !hostOf(source.url)) {
        report.error("source-url-missing", `${label}: 出典URLが欠落または不正: ${source.url}`)
      }
      if (source.type && !SOURCE_TYPES.includes(source.type)) {
        report.error("source-type-invalid", `${label}: 出典種別が不正: ${source.type}`)
      }
      if (source.url && hostOf(source.url) && new URL(source.url).pathname === "/") {
        report.warn("source-top-page-only", `${label}`)
      }
    }
    if (c.sources.length > 0 && !c.sources.some((s) => PRIMARY_SOURCE_TYPES.has(s.type))) {
      report.warn("source-secondary-only", `${label}`)
    }

    if (!c.members) {
      if (c.debutYear === null) report.warn("debut-year-unknown", `${label}: 芸歴開始年が不明`)
      continue
    }

    // グループ
    if (c.members.length === 0) {
      report.error("group-members-empty", `${label}: members が0件`)
      continue
    }
    if (c.members.length === 1) {
      report.warn("group-single-member", `${label}: members が1件のみ（コンビ・グループのメンバー欠落の可能性）`)
    }
    if (c.mixedMemberDebutYears === true && c.debutYear !== null) {
      report.error("mixed-group-has-debut-year", `${label}: メンバー間で芸歴開始年が異なるのに group debutYear=${c.debutYear}`)
    }
    const derived = deriveGroupDebut(c.members.map((m) => m.debutYear ?? null))
    if (c.debutYear !== derived.debutYear) {
      report.error(
        "group-debut-year-inconsistent",
        `${label}: group debutYear=${c.debutYear} がメンバーの年から求めた値 ${derived.debutYear} と不一致`
      )
    }
    for (const name of findDuplicates(c.members.map((m) => m.name))) {
      report.error("member-name-duplicate", `${label}: メンバー名が重複: ${name}`)
    }
    for (const m of c.members) {
      if (!m.name?.trim()) report.error("member-name-missing", `${label}: メンバー名が空`)
      if (m.debutYear != null && !isValidYear(m.debutYear)) {
        report.error("member-debut-year-invalid", `${label} / ${m.name}: debutYear が異常値: ${m.debutYear}`)
      }
      if (m.debutYear == null) {
        report.warn("member-debut-year-unknown", `${label} / ${m.name}`)
      }
      if (m.birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(m.birthDate)) {
        report.error("member-birth-date-invalid", `${label} / ${m.name}: birthDate の形式が不正: ${m.birthDate}`)
      }
      if (comedianNames.has(m.name)) {
        report.warn("member-name-is-entry", `${label} のメンバー「${m.name}」が別エントリ名と同じ（二重登録の可能性）`)
      }
      memberNameOwners.set(m.name, [...(memberNameOwners.get(m.name) ?? []), label])
    }
  }

  for (const [name, owners] of memberNameOwners) {
    if (owners.length > 1) {
      report.warn("member-name-duplicate-across-groups", `「${name}」が複数グループに所属: ${owners.join(", ")}`)
    }
  }
}

// ---------------------------------------------------------------------------
// 出力
// ---------------------------------------------------------------------------

function tsLiteral(value, indent) {
  const pad = "  ".repeat(indent)
  const padEnd = "  ".repeat(indent - 1)

  if (value === undefined) return undefined
  if (value === null) return "null"
  if (typeof value === "string") return JSON.stringify(value)
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]"
    const items = value
      .map((item) => `${pad}${tsLiteral(item, indent + 1)},`)
      .join("\n")
    return `[\n${items}\n${padEnd}]`
  }
  if (typeof value === "object") {
    const lines = Object.entries(value)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${pad}${k}: ${tsLiteral(v, indent + 1)},`)
    return `{\n${lines.join("\n")}\n${padEnd}}`
  }
  return JSON.stringify(value)
}

export function renderComediansTs(entries, metadata) {
  const body = entries.map((entry) => `  ${tsLiteral(entry, 2)},`).join("\n")

  const header = `import type { Comedian } from "@/types/comedian"

// このファイルは data/geireki-matome.seed.json から自動生成されています。
// 直接編集せず、シードJSONを更新して \`npm run data:import\` を再実行してください。
// データの意味・運用ルール（slug の付け方を含む）は docs/data-policy.md を参照。
//
// ${metadata.warning}
// 出典（一次確認前の二次情報源）: ${metadata.primarySource}
// 芸歴基準の定義: ${metadata.sourceCareerRuleUrl}

export const comedians: Comedian[] = [
`

  return header + body + "\n]\n"
}

// ---------------------------------------------------------------------------
// レポート表示
// ---------------------------------------------------------------------------

// 同じ code の警告はまとめて表示する
export function printReport(report, { verbose = false } = {}) {
  for (const level of ["ERROR", "WARNING"]) {
    const items = report.issues.filter((i) => i.level === level)
    console.log(`\n${level} (${items.length})`)
    const byCode = new Map()
    for (const item of items) {
      byCode.set(item.code, [...(byCode.get(item.code) ?? []), item.message])
    }
    for (const [code, messages] of byCode) {
      console.log(`  [${code}] ${messages.length}件`)
      const shown = verbose || level === "ERROR" ? messages : messages.slice(0, 5)
      for (const message of shown) console.log(`    - ${message}`)
      if (shown.length < messages.length) {
        console.log(`    … 他 ${messages.length - shown.length}件（--verbose で全件表示）`)
      }
    }
  }
}

export function hasErrors(report) {
  return report.issues.some((i) => i.level === "ERROR")
}
