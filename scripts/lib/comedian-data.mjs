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

export const SUPPORTED_SCHEMA_VERSION = 3

export const VERIFICATION_STATUSES = [
  "candidate_unverified",
  "extracted_secondary",
  "official_single_source",
  "verified_multi_source",
  "conflict_needs_review",
  "manual_verified",
]

// schemaVersion 1 で使っていた旧値。seed は移行済みのため、検出したら ERROR にする。
const LEGACY_VERIFICATION_STATUSES = {
  unverified_secondary_source: "extracted_secondary",
}

export const CAREER_START_YEAR_STATUSES = ["confirmed", "secondary_source", "estimated", "unknown"]

// 芸歴開始年の根拠（docs/data-policy.md「芸歴の定義」）
export const CAREER_START_BASES = [
  "school_graduation",
  "apprenticeship",
  "professional_debut",
  "first_stage",
  "professional_activity",
  "indie_activity",
  "secondary_source_editorial",
  "unknown",
]

// 出典の優先順位 A: 一次情報 / B: 補助・照合 / C: 候補発見用
export const SOURCE_TIERS = {
  agency_official: "A",
  school_official: "A",
  award_official: "A",
  official_interview: "A",
  news: "B",
  interview: "B",
  wikipedia: "B",
  secondary_database: "C",
}
export const SOURCE_TYPES = Object.keys(SOURCE_TIERS)

export const STATUSES = ["active", "inactive", "disbanded", "unknown"]

// グループメンバーの所属状態。未指定は current として扱う。
export const MEMBERSHIP_STATUSES = ["current", "former"]
export const isCurrentMember = (member) => member.membershipStatus !== "former"

// 新規レコードの slug: 小文字ASCII・kebab-case
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
// 自動採番風の slug（既存 id 形式）は新規レコードでは使わない
const AUTO_NUMBERED_SLUG = /^(?:group|person)-\d+$/

// ---------------------------------------------------------------------------
// レガシー判定
// ---------------------------------------------------------------------------

// metadata.legacyRecords の範囲内の id（group-0001〜 / person-0001〜）は
// schemaVersion 2 以前から存在するレガシーレコード。新規レコード向けの必須ルールを免除する。
export function createLegacyChecker(metadata) {
  const { groupIdMax = 0, personIdMax = 0 } = metadata.legacyRecords ?? {}
  return (id) => {
    const match = /^(group|person)-(\d{4})$/.exec(id ?? "")
    if (!match) return false
    const n = Number(match[2])
    return match[1] === "group" ? n <= groupIdMax : n <= personIdMax
  }
}

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

function toSource(raw) {
  return {
    title: raw.title,
    url: raw.url,
    checkedAt: raw.checkedAt,
    type: raw.type,
    fields: raw.fields,
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

// careerStartBasis は推定しない。seed に明示が無ければ unknown。
function personCareerStartBasis(person) {
  return person.careerStartBasis ?? "unknown"
}

// seed に明示があればそれを使う。無い場合、年があれば secondary_source（自動で confirmed に昇格させない）。
function personCareerStartYearStatus(person) {
  if (person.careerStartYearStatus) return person.careerStartYearStatus
  return person.careerStartYear == null ? "unknown" : "secondary_source"
}

function allSame(values) {
  return new Set(values.map((v) => JSON.stringify(v ?? null))).size === 1
}

// メンバーの芸歴開始年から、グループの careerStartYear と mixed 判定を求める。
// 全員が判明かつ一致 → その年 / 異なる → null (mixed: true) / 一部不明 → null (mixed: null)
export function deriveGroupCareerStart(memberYears) {
  const known = memberYears.filter((y) => y != null)
  const distinct = new Set(known)
  if (distinct.size > 1) return { careerStartYear: null, mixed: true }
  if (known.length === memberYears.length && distinct.size === 1) {
    return { careerStartYear: known[0], mixed: false }
  }
  return { careerStartYear: null, mixed: null }
}

// seed の任意項目。存在する場合のみそのまま出力する。
function optionalFields(record) {
  return {
    nameKana: record.nameKana ?? undefined,
    aliases: record.aliases?.length ? record.aliases : undefined,
  }
}

function buildMember(person) {
  return {
    id: person.id,
    slug: person.slug ?? undefined,
    name: person.name,
    nameKana: person.nameKana ?? undefined,
    birthDate: person.birthDate ?? null,
    careerStartYear: person.careerStartYear ?? null,
    careerStartYearStatus: personCareerStartYearStatus(person),
    careerStartBasis: personCareerStartBasis(person),
    school: person.school ?? null,
    schoolGeneration: person.schoolGeneration ?? null,
    schoolEquivalent: formatSchoolEquivalent(person.schoolEquivalent),
    verificationStatus: person.verificationStatus ?? undefined,
    sources: (person.sources ?? []).map(toSource),
    // seed に明示がある場合のみ出力（未指定は current 扱い）
    membershipStatus: person.membershipStatus ?? undefined,
    leftYear: person.leftYear ?? undefined,
  }
}

export function buildComedians(seed) {
  const { people, groups, metadata } = seed
  const isLegacy = createLegacyChecker(metadata)
  const entries = []

  // 1. グループ：メンバーの芸歴開始年が一致するかに関係なく、常に1エントリにまとめる
  for (const g of groups) {
    const members = g.members
      .map((name) => people.find((p) => p.name === name && p.group === g.name))
      .filter(Boolean)
      .map(buildMember)

    // グループ単位の値（芸歴開始年・養成所など）は現在メンバーのみから求める。元メンバーは人物情報として保持する。
    const current = members.filter(isCurrentMember)
    const { careerStartYear, mixed } = deriveGroupCareerStart(current.map((m) => m.careerStartYear))

    const schoolKeys = current.map((m) => [m.school, m.schoolGeneration])
    const sameSchool = allSame(schoolKeys)
    const equivalents = current.map((m) => m.schoolEquivalent)
    const sameEquivalent = allSame(equivalents)

    let careerStartYearStatus = "unknown"
    let careerStartBasis
    if (careerStartYear != null) {
      const statuses = current.map((m) => m.careerStartYearStatus)
      careerStartYearStatus = statuses.every((s) => s === "confirmed")
        ? "confirmed"
        : statuses.includes("estimated")
          ? "estimated"
          : "secondary_source"
      const bases = current.map((m) => m.careerStartBasis)
      careerStartBasis = allSame(bases) ? bases[0] : "unknown"
    }

    // グループ自体の出典。seed に明示が無いレガシーレコードはメンバーの出典をまとめて使う。
    const sources = g.sources?.length
      ? g.sources.map(toSource)
      : isLegacy(g.id)
        ? uniqueSources(members.flatMap((m) => m.sources))
        : []

    entries.push({
      id: g.id,
      slug: g.slug ?? g.id,
      name: g.name,
      ...optionalFields(g),
      careerStartYear,
      careerStartYearStatus,
      careerStartBasis,
      formationYear: g.formationYear,
      agency: g.agency,
      school: sameSchool ? schoolKeys[0][0] : null,
      schoolGeneration: sameSchool ? schoolKeys[0][1] : null,
      schoolEquivalent: sameEquivalent ? equivalents[0] : null,
      members,
      mixedMemberCareerStartYears: mixed,
      status: g.status ?? "unknown",
      // グループ自体の情報の確認状況（メンバーの確認状況からは導出しない）
      verificationStatus: g.verificationStatus ?? undefined,
      sources,
    })
  }

  // 2. どの組にも属さない個人（ピン芸人）
  for (const person of people.filter((p) => !p.group)) {
    entries.push({
      id: person.id,
      slug: person.slug ?? person.id,
      name: person.name,
      ...optionalFields(person),
      careerStartYear: person.careerStartYear ?? null,
      careerStartYearStatus: personCareerStartYearStatus(person),
      careerStartBasis: personCareerStartBasis(person),
      agency: person.agency,
      birthDate: person.birthDate ?? null,
      school: person.school ?? null,
      schoolGeneration: person.schoolGeneration ?? null,
      schoolEquivalent: formatSchoolEquivalent(person.schoolEquivalent),
      status: person.status ?? "unknown",
      verificationStatus: person.verificationStatus ?? undefined,
      sources: (person.sources ?? []).map(toSource),
    })
  }

  // 並び順：芸歴開始年（グループで null の場合はメンバー中の最も早い年）→ 名前
  const sortYear = (c) =>
    c.careerStartYear ??
    Math.min(...(c.members ?? []).map((m) => m.careerStartYear ?? Infinity), Infinity)
  entries.sort((a, b) => sortYear(a) - sortYear(b) || a.name.localeCompare(b.name, "ja"))

  return entries
}

// ---------------------------------------------------------------------------
// 検証
// ---------------------------------------------------------------------------

// legacy: true の問題はレガシーレコード由来（WARNING は件数のみ表示）
export function createReport() {
  const issues = []
  return {
    issues,
    error(code, message, { legacy = false } = {}) {
      issues.push({ level: "ERROR", code, message, legacy })
    },
    warn(code, message, { legacy = false } = {}) {
      issues.push({ level: "WARNING", code, message, legacy })
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

function checkVerificationStatus(report, label, value, opts) {
  if (value == null) return
  if (LEGACY_VERIFICATION_STATUSES[value]) {
    report.error(
      "verification-status-legacy-value",
      `${label}: verificationStatus が旧値 ${value}（${LEGACY_VERIFICATION_STATUSES[value]} に移行してください）`,
      opts
    )
  } else if (!VERIFICATION_STATUSES.includes(value)) {
    report.error("verification-status-invalid", `${label}: verificationStatus が定義外: ${value}`, opts)
  }
}

// 個人（ピン芸人の Comedian / グループの Member）の芸歴開始年・確認状況・出典
function checkPersonRecord(report, label, rec, opts) {
  const { legacy } = opts

  if (rec.careerStartYear != null && !isValidYear(rec.careerStartYear)) {
    report.error("career-start-year-invalid", `${label}: careerStartYear が異常値: ${rec.careerStartYear}`, opts)
  }
  if (rec.careerStartYearStatus && !CAREER_START_YEAR_STATUSES.includes(rec.careerStartYearStatus)) {
    report.error("career-start-year-status-invalid", `${label}: careerStartYearStatus が定義外: ${rec.careerStartYearStatus}`, opts)
  }
  if (rec.careerStartYear == null && rec.careerStartYearStatus && rec.careerStartYearStatus !== "unknown") {
    report.error("career-start-year-status-mismatch", `${label}: careerStartYear が null なのに careerStartYearStatus=${rec.careerStartYearStatus}`, opts)
  }
  if (rec.careerStartYear != null && rec.careerStartYearStatus === "unknown") {
    report.error("career-start-year-status-mismatch", `${label}: careerStartYear=${rec.careerStartYear} なのに careerStartYearStatus=unknown`, opts)
  }

  checkCareerStartBasis(report, label, rec, opts)
  checkVerificationStatus(report, label, rec.verificationStatus, opts)

  // 情報源間で矛盾がある場合は芸歴比較から除外する（careerStartYear を null にする）
  if (rec.verificationStatus === "conflict_needs_review" && rec.careerStartYear != null) {
    report.error(
      "conflict-has-career-start-year",
      `${label}: conflict_needs_review なのに careerStartYear=${rec.careerStartYear}（解決するまで null にして比較から除外する）`,
      opts
    )
  }

  const sources = rec.sources ?? []
  const tiers = sources.map((s) => SOURCE_TIERS[s.type])

  // C（候補発見用）だけを根拠に確認済みへ昇格させない
  if (
    (rec.careerStartYearStatus === "confirmed" || rec.verificationStatus === "verified_multi_source") &&
    !tiers.some((t) => t === "A" || t === "B")
  ) {
    report.error(
      "promoted-without-reliable-source",
      `${label}: careerStartYearStatus=${rec.careerStartYearStatus} / verificationStatus=${rec.verificationStatus} だが A・B ランクの出典がない`,
      opts
    )
  }

  if (rec.careerStartYear != null && sources.length === 0) {
    report.warn("career-start-year-without-source", `${label}: careerStartYear=${rec.careerStartYear} だが出典がない`, opts)
  }
  if (
    !legacy &&
    rec.careerStartYear != null &&
    sources.length > 0 &&
    !sources.some((s) => s.fields?.includes("careerStartYear"))
  ) {
    report.warn("career-start-year-source-field-missing", `${label}: careerStartYear の根拠となる出典（fields に "careerStartYear"）がない`, opts)
  }
  checkSourceLevel(report, label, rec.verificationStatus, sources, opts)
}

// careerStartBasis（芸歴開始年の根拠）と年・確認状況の整合性。個人・グループ共通。
function checkCareerStartBasis(report, label, rec, opts) {
  const basis = rec.careerStartBasis
  if (basis == null) return
  if (!CAREER_START_BASES.includes(basis)) {
    report.error("career-start-basis-invalid", `${label}: careerStartBasis が定義外: ${basis}`, opts)
    return
  }
  if (rec.careerStartYear == null && basis !== "unknown") {
    report.error("career-start-basis-without-year", `${label}: careerStartYear が null なのに careerStartBasis=${basis}`, opts)
  }
  if (rec.careerStartYearStatus === "confirmed" && (basis === "unknown" || basis === "secondary_source_editorial")) {
    report.error(
      "confirmed-without-basis",
      `${label}: careerStartYearStatus=confirmed だが careerStartBasis=${basis}（根拠が確認できない年を確認済みにしない）`,
      opts
    )
  }
  if (!opts.legacy && rec.careerStartYear != null && basis === "unknown") {
    report.warn("career-start-basis-unknown", `${label}: careerStartYear=${rec.careerStartYear} だが careerStartBasis が unknown`, opts)
  }
}

function checkSourceLevel(report, label, verificationStatus, sources, opts) {
  if (verificationStatus === "official_single_source" && !sources.some((s) => SOURCE_TIERS[s.type] === "A")) {
    report.warn("official-without-official-source", `${label}: official_single_source だが公式系（A ランク）の出典がない`, opts)
  }
  if (verificationStatus === "verified_multi_source" && sources.length <= 1) {
    report.warn("multi-source-insufficient", `${label}: verified_multi_source だが出典が ${sources.length} 件`, opts)
  }
}

function checkSources(report, label, sources, opts) {
  for (const source of sources) {
    if (!source.url || !hostOf(source.url)) {
      report.error("source-url-missing", `${label}: 出典URLが欠落または不正: ${source.url}`, opts)
    }
    if (!source.title?.trim()) {
      report.error("source-title-missing", `${label}: 出典タイトルが空: ${source.url}`, opts)
    }
    if (source.type == null) {
      report.warn("source-type-missing", `${label}: 出典種別が未設定: ${source.url}`, opts)
    } else if (!SOURCE_TYPES.includes(source.type)) {
      report.error("source-type-invalid", `${label}: 出典種別が定義外: ${source.type}`, opts)
    }
    if (!source.fields?.length) {
      report.warn("source-fields-empty", `${label}: 出典の fields が空: ${source.url}`, opts)
    }
  }
}

// schemaVersion 3 で改名した旧フィールド名（debutYear 系）が残っていないか
const LEGACY_FIELD_NAMES = {
  debutYear: "careerStartYear",
  debutYearStatus: "careerStartYearStatus",
  debutType: "careerStartBasis",
  memberDebutYears: "memberCareerStartYears",
  mixedMemberDebutYears: "mixedMemberCareerStartYears",
  derivedEarliestDebutYear: "derivedEarliestCareerStartYear",
  derivedLatestDebutYear: "derivedLatestCareerStartYear",
}

function checkLegacyFieldNames(report, label, record, opts) {
  for (const [oldName, newName] of Object.entries(LEGACY_FIELD_NAMES)) {
    if (oldName in record) {
      report.error("seed-legacy-field-name", `${label}: 旧フィールド名 ${oldName} が残っている（${newName} を使う）`, opts)
    }
  }
  for (const source of record.sources ?? []) {
    for (const field of source.fields ?? []) {
      if (LEGACY_FIELD_NAMES[field]) {
        report.error(
          "source-fields-legacy-name",
          `${label}: sources[].fields に旧フィールド名 ${field} がある（${LEGACY_FIELD_NAMES[field]} を使う）`,
          opts
        )
      }
    }
  }
}

export function validateSeed(seed, report) {
  const { people, groups, metadata } = seed
  const isLegacy = createLegacyChecker(metadata)

  if (metadata.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
    report.error(
      "schema-version-unsupported",
      `metadata.schemaVersion=${metadata.schemaVersion}（対応しているのは ${SUPPORTED_SCHEMA_VERSION}）`
    )
  }
  if (!metadata.legacyRecords) {
    report.error("legacy-records-missing", "metadata.legacyRecords が無い（既存レコードとの区別ができない）")
  }

  for (const id of findDuplicates([...people.map((p) => p.id), ...groups.map((g) => g.id)])) {
    report.error("seed-id-duplicate", `id が重複: ${id}`)
  }
  for (const name of findDuplicates(groups.map((g) => g.name))) {
    report.error("seed-group-name-duplicate", `group name が重複: ${name}`)
  }

  // slug ルール：ページを持つレコード（グループ・ピン芸人）
  const pageRecords = [...groups, ...people.filter((p) => !p.group)]
  for (const record of pageRecords) {
    const legacy = isLegacy(record.id)
    const label = `${record.name}（${record.id}）`
    if (legacy) {
      if (record.slug != null && record.slug !== record.id) {
        report.error("legacy-slug-changed", `${label}: 既存レコードの slug は id のまま維持する（公開済みURLが変わる）: ${record.slug}`, { legacy })
      }
      continue
    }
    if (!record.slug) {
      report.error("slug-missing", `${label}: 新規レコードには slug を明示する`)
    } else if (!SLUG_PATTERN.test(record.slug)) {
      report.error("slug-format", `${label}: slug は小文字ASCIIの kebab-case にする: ${record.slug}`)
    } else if (AUTO_NUMBERED_SLUG.test(record.slug)) {
      report.error("slug-auto-numbered", `${label}: slug に自動採番形式は使わない: ${record.slug}`)
    }
  }
  for (const p of people.filter((p) => p.group && p.slug != null)) {
    if (!SLUG_PATTERN.test(p.slug)) {
      report.error("slug-format", `${p.name}（${p.id}）: slug は小文字ASCIIの kebab-case にする: ${p.slug}`)
    }
  }

  const groupNames = new Set(groups.map((g) => g.name))

  for (const p of people) {
    const opts = { legacy: isLegacy(p.id) }
    if (p.group && !groupNames.has(p.group)) {
      report.error("seed-unknown-group", `${p.name}（${p.id}）の group「${p.group}」が groups に存在しない`, opts)
    }
    if ("source" in p) {
      report.error("seed-legacy-source-field", `${p.name}（${p.id}）: 旧形式の source がある（sources[] を使う）`, opts)
    }
    checkLegacyFieldNames(report, `${p.name}（${p.id}）`, p, opts)
    if (p.membershipStatus != null && !MEMBERSHIP_STATUSES.includes(p.membershipStatus)) {
      report.error("membership-status-invalid", `${p.name}（${p.id}）: membershipStatus が定義外: ${p.membershipStatus}`, opts)
    }
    if (p.membershipStatus != null && !p.group) {
      report.error("membership-status-without-group", `${p.name}（${p.id}）: グループに属さない人物に membershipStatus がある`, opts)
    }
    if (p.status != null && !STATUSES.includes(p.status)) {
      report.error("status-invalid", `${p.name}: status が定義外: ${p.status}`, opts)
    }
  }

  for (const g of groups) {
    const opts = { legacy: isLegacy(g.id) }
    const groupPeople = people.filter((p) => p.group === g.name)

    if (g.status != null && !STATUSES.includes(g.status)) {
      report.error("status-invalid", `${g.name}: status が定義外: ${g.status}`, opts)
    }
    checkLegacyFieldNames(report, `${g.name}（${g.id}）`, g, opts)
    for (const name of g.members) {
      if (!groupPeople.some((p) => p.name === name)) {
        report.error("seed-member-not-found", `${g.name} のメンバー「${name}」が people に存在しない`, opts)
      }
    }
    for (const p of groupPeople) {
      if (!g.members.includes(p.name)) {
        report.error("seed-member-not-listed", `${p.name} は group「${g.name}」所属だが groups.members に含まれていない`, opts)
      }
    }

    // memberCareerStartYears / mixedMemberCareerStartYears は people と矛盾していないか
    if (g.memberCareerStartYears) {
      for (const name of g.members) {
        const person = groupPeople.find((p) => p.name === name)
        if (!person) continue
        const listed = g.memberCareerStartYears[name]
        if (listed === undefined) {
          report.error("seed-member-career-start-missing", `${g.name}: memberCareerStartYears に ${name} がない`, opts)
        } else if ((listed ?? null) !== (person.careerStartYear ?? null)) {
          report.error(
            "seed-member-career-start-mismatch",
            `${g.name}: memberCareerStartYears[${name}]=${listed} と people.careerStartYear=${person.careerStartYear} が不一致`,
            opts
          )
        }
      }
    }
    if (g.mixedMemberCareerStartYears !== undefined) {
      const { mixed } = deriveGroupCareerStart(
        groupPeople.filter(isCurrentMember).map((p) => p.careerStartYear ?? null)
      )
      if ((g.mixedMemberCareerStartYears ?? null) !== mixed) {
        report.error(
          "seed-mixed-flag-mismatch",
          `${g.name}: mixedMemberCareerStartYears=${g.mixedMemberCareerStartYears} だがメンバーの年から求めると ${mixed}`,
          opts
        )
      }
    }
  }
}

export function validateComedians(entries, report, metadata) {
  const isLegacy = createLegacyChecker(metadata)
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
    const opts = { legacy: isLegacy(c.id) }

    if (!c.name?.trim()) report.error("name-missing", `${c.id}: name が空`, opts)
    if (!c.slug?.trim()) report.error("slug-missing", `${c.id}: slug が空`, opts)

    if (c.formationYear != null && !isValidYear(c.formationYear)) {
      report.error("formation-year-invalid", `${label}: formationYear が異常値: ${c.formationYear}`, opts)
    }
    if (!STATUSES.includes(c.status)) {
      report.error("status-invalid", `${label}: status が定義外: ${c.status}`, opts)
    } else if (c.status === "unknown") {
      report.warn("status-unknown", `${label}`, opts)
    }
    if (c.birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(c.birthDate)) {
      report.error("birth-date-invalid", `${label}: birthDate の形式が不正: ${c.birthDate}`, opts)
    }

    // 出典
    if (c.sources.length === 0) {
      report.warn("source-missing", `${label}: 出典が1件もない`, opts)
    }
    checkSources(report, label, c.sources, opts)
    for (const source of c.sources) {
      if (source.url && hostOf(source.url) && new URL(source.url).pathname === "/") {
        report.warn("source-top-page-only", `${label}`, opts)
      }
    }
    if (c.sources.length > 0 && !c.sources.some((s) => SOURCE_TIERS[s.type] === "A")) {
      report.warn("source-secondary-only", `${label}`, opts)
    }

    if (!c.members) {
      checkPersonRecord(report, label, c, opts)
      continue
    }

    // グループ自体
    checkCareerStartBasis(report, label, c, opts)
    checkVerificationStatus(report, label, c.verificationStatus, opts)
    checkSourceLevel(report, label, c.verificationStatus, c.sources, opts)
    if (c.careerStartYear != null && !isValidYear(c.careerStartYear)) {
      report.error("career-start-year-invalid", `${label}: careerStartYear が異常値: ${c.careerStartYear}`, opts)
    }
    if ((c.careerStartYear == null) !== (c.careerStartYearStatus === "unknown")) {
      report.error("career-start-year-status-mismatch", `${label}: careerStartYear=${c.careerStartYear} と careerStartYearStatus=${c.careerStartYearStatus} が矛盾`, opts)
    }
    if (c.members.length === 0) {
      report.error("group-members-empty", `${label}: members が0件`, opts)
      continue
    }
    const currentMembers = c.members.filter(isCurrentMember)
    if (currentMembers.length === 0) {
      report.error("group-no-current-member", `${label}: 現在メンバー（membershipStatus が former 以外）が0人`, opts)
    }
    if (currentMembers.length === 1) {
      report.warn("group-single-member", `${label}: 現在メンバーが1人のみ（コンビ・グループのメンバー欠落の可能性）`, opts)
    }
    if (c.mixedMemberCareerStartYears === true && c.careerStartYear !== null) {
      report.error("mixed-group-has-career-start-year", `${label}: メンバー間で芸歴開始年が異なるのに group careerStartYear=${c.careerStartYear}`, opts)
    }
    // グループ単位の値は現在メンバーのみから求める（元メンバーを含めて計算していたら ERROR）
    const derived = deriveGroupCareerStart(currentMembers.map((m) => m.careerStartYear ?? null))
    const derivedWithFormer = deriveGroupCareerStart(c.members.map((m) => m.careerStartYear ?? null))
    if (
      currentMembers.length !== c.members.length &&
      (c.careerStartYear !== derived.careerStartYear || (c.mixedMemberCareerStartYears ?? null) !== derived.mixed) &&
      c.careerStartYear === derivedWithFormer.careerStartYear &&
      (c.mixedMemberCareerStartYears ?? null) === derivedWithFormer.mixed
    ) {
      report.error("former-member-in-group-calculation", `${label}: グループの芸歴開始年の計算に元メンバーが含まれている`, opts)
    }
    if ((c.mixedMemberCareerStartYears ?? null) !== derived.mixed) {
      report.error(
        "mixed-flag-inconsistent",
        `${label}: mixedMemberCareerStartYears=${c.mixedMemberCareerStartYears} が現在メンバーの年から求めた値 ${derived.mixed} と不一致`,
        opts
      )
    }
    if (c.careerStartYear !== derived.careerStartYear) {
      report.error(
        "group-career-start-year-inconsistent",
        `${label}: group careerStartYear=${c.careerStartYear} が現在メンバーの年から求めた値 ${derived.careerStartYear} と不一致`,
        opts
      )
    }
    for (const name of findDuplicates(c.members.map((m) => m.name))) {
      report.error("member-name-duplicate", `${label}: メンバー名が重複: ${name}`, opts)
    }

    // メンバー個人
    for (const m of c.members) {
      if (m.membershipStatus != null && !MEMBERSHIP_STATUSES.includes(m.membershipStatus)) {
        report.error("membership-status-invalid", `${label} / ${m.name}: membershipStatus が定義外: ${m.membershipStatus}`, { legacy: isLegacy(m.id) })
      }
      if (m.membershipStatus === "former" && m.leftYear == null) {
        report.warn("former-left-year-missing", `${label} / ${m.name}: 元メンバーだが leftYear がない`, { legacy: isLegacy(m.id) })
      }
      if (m.leftYear != null && !isValidYear(m.leftYear)) {
        report.warn("left-year-invalid", `${label} / ${m.name}: leftYear が未来年または異常値: ${m.leftYear}`, { legacy: isLegacy(m.id) })
      }
      if (m.leftYear != null && isCurrentMember(m)) {
        report.warn("left-year-on-current-member", `${label} / ${m.name}: 現在メンバーに leftYear がある`, { legacy: isLegacy(m.id) })
      }
      const memberLabel = `${label} / ${m.name}`
      const memberOpts = { legacy: isLegacy(m.id) }
      if (!m.name?.trim()) report.error("member-name-missing", `${label}: メンバー名が空`, memberOpts)
      if (m.birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(m.birthDate)) {
        report.error("member-birth-date-invalid", `${memberLabel}: birthDate の形式が不正: ${m.birthDate}`, memberOpts)
      }
      if (m.careerStartYear == null) {
        report.warn("member-career-start-year-unknown", memberLabel, memberOpts)
      }
      checkPersonRecord(report, memberLabel, m, memberOpts)
      checkSources(report, memberLabel, m.sources ?? [], memberOpts)
      if (comedianNames.has(m.name)) {
        report.warn("member-name-is-entry", `${label} のメンバー「${m.name}」が別エントリ名と同じ（二重登録の可能性）`, memberOpts)
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

function printGrouped(items, { showMessages, limit }) {
  const byCode = new Map()
  for (const item of items) {
    byCode.set(item.code, [...(byCode.get(item.code) ?? []), item.message])
  }
  for (const [code, messages] of byCode) {
    console.log(`  [${code}] ${messages.length}件`)
    if (!showMessages) continue
    const shown = limit ? messages.slice(0, limit) : messages
    for (const message of shown) console.log(`    - ${message}`)
    if (shown.length < messages.length) {
      console.log(`    … 他 ${messages.length - shown.length}件（--verbose で全件表示）`)
    }
  }
}

// ERROR は常に全件表示。WARNING は新規レコード分を表示し、レガシーレコード分は件数のみ表示する。
export function printReport(report, { verbose = false } = {}) {
  const errors = report.issues.filter((i) => i.level === "ERROR")
  const warnings = report.issues.filter((i) => i.level === "WARNING")
  const newWarnings = warnings.filter((i) => !i.legacy)
  const legacyWarnings = warnings.filter((i) => i.legacy)

  console.log(`\nERROR (${errors.length})`)
  printGrouped(errors, { showMessages: true })

  console.log(`\nWARNING 新規レコード (${newWarnings.length})`)
  printGrouped(newWarnings, { showMessages: true, limit: verbose ? 0 : 20 })

  console.log(`\nWARNING レガシーレコード (${legacyWarnings.length})${verbose ? "" : " ※件数のみ。--verbose で全件表示"}`)
  printGrouped(legacyWarnings, { showMessages: verbose })
}

export function hasErrors(report) {
  return report.issues.some((i) => i.level === "ERROR")
}
