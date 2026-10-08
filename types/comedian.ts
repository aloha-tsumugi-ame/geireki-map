// 芸人データの型定義。値の意味・運用ルールは docs/data-policy.md を参照。

export type VerificationStatus =
  | "candidate_unverified"
  | "extracted_secondary"
  | "official_single_source"
  | "verified_multi_source"
  | "conflict_needs_review"
  | "manual_verified"

export type DebutYearStatus =
  | "confirmed"
  | "secondary_source"
  | "estimated"
  | "unknown"

export type DebutType =
  | "first_stage"
  | "professional_activity"
  | "agency_entry"
  | "school_graduation"
  | "apprenticeship"
  | "indie_start"
  | "secondary_source_editorial"
  | "unknown"

export type Comedian = {
  id: string
  slug: string

  name: string
  nameKana?: string
  aliases?: string[]

  // 芸人として活動を開始した年。グループの場合はメンバー全員の年が一致するときのみ設定し、
  // 異なる・一部不明のときは null（最古メンバーの年を自動採用しない）。
  debutYear: number | null
  debutYearStatus?: DebutYearStatus
  debutType?: DebutType

  // コンビ・トリオ等の結成年。debutYear とは別物で、相互に推定しない。
  formationYear?: number | null

  agency?: string | null

  // ピン芸人のみ
  birthDate?: string | null

  school?: string | null
  schoolGeneration?: number | null
  schoolEquivalent?: string | null

  // グループのみ。members がある Comedian をグループとして扱う。
  members?: Member[]
  // true: メンバー間で芸歴開始年が異なる / false: 一致 / null: 一部不明で判定不能
  mixedMemberDebutYears?: boolean | null

  status: "active" | "inactive" | "disbanded"

  verificationStatus?: VerificationStatus

  description?: string

  sources: Source[]
}

export type Member = {
  // seed の person id。旧個人ページURL（/comedians/person-xxxx）のリダイレクトにも使う。
  id?: string
  slug?: string

  name: string
  nameKana?: string

  birthDate?: string | null

  debutYear?: number | null

  school?: string | null
  schoolGeneration?: number | null
  schoolEquivalent?: string | null
}

export type SourceType =
  | "agency_official"
  | "school_official"
  | "award_official"
  | "secondary_database"
  | "wikipedia"
  | "news"

export type Source = {
  title: string
  url: string
  // 出典を参照した日（seed 作成時の参照日）。公式確認日ではない。
  checkedAt?: string
  type?: SourceType
  // この出典が根拠となる項目名（例: "debutYear"）。不明な場合は未設定。
  fields?: string[]
}
