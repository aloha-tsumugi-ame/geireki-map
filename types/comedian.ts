// 芸人データの型定義。値の意味・運用ルールは docs/data-policy.md を参照。

export type VerificationStatus =
  | "candidate_unverified"
  | "extracted_secondary"
  | "official_single_source"
  | "verified_multi_source"
  | "conflict_needs_review"
  | "manual_verified"

// careerStartYear の確認状況（旧 DebutYearStatus と同じ意味）
export type CareerStartYearStatus =
  | "confirmed"
  | "secondary_source"
  | "estimated"
  | "unknown"

// careerStartYear を何を根拠に採用したか（docs/data-policy.md「芸歴の定義」）
export type CareerStartBasis =
  // 養成所卒業・卒業後のプロ活動開始
  | "school_graduation"
  // 弟子入り・入門
  | "apprenticeship"
  // 公式等で明記されたプロデビュー
  | "professional_debut"
  // 初舞台
  | "first_stage"
  // その他、プロ芸人として活動開始したことが明確
  | "professional_activity"
  // 事務所所属前の継続的な芸人活動
  | "indie_activity"
  // 既存の geireki-matome 等の二次情報による芸歴年
  | "secondary_source_editorial"
  // 根拠となる開始地点が確認できない
  | "unknown"

export type Comedian = {
  id: string
  slug: string

  name: string
  nameKana?: string
  aliases?: string[]

  // 芸歴開始年 = プロの芸人としてのキャリアが始まった年。
  // グループの場合はメンバー全員の年が一致するときのみ設定し、
  // 異なる・一部不明のときは null（最古メンバーの年を自動採用しない）。
  careerStartYear: number | null
  careerStartYearStatus?: CareerStartYearStatus
  careerStartBasis?: CareerStartBasis

  // コンビ・トリオ等の結成年。careerStartYear とは別物で、相互に推定しない。
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
  mixedMemberCareerStartYears?: boolean | null

  // seed に明示されていない場合は "unknown"（確認していない活動状況を確定値にしない）
  status: "active" | "inactive" | "disbanded" | "unknown"

  // グループの場合は、グループ自体の情報（存在・メンバー構成・所属・結成年など）の確認状況。
  // メンバー個人の芸歴開始年の確認状況は members[].verificationStatus / careerStartYearStatus で管理する。
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
  // 別名・旧芸名など（検索に使う）
  aliases?: string[]

  birthDate?: string | null

  careerStartYear?: number | null
  careerStartYearStatus?: CareerStartYearStatus
  careerStartBasis?: CareerStartBasis

  school?: string | null
  schoolGeneration?: number | null
  schoolEquivalent?: string | null

  // メンバー個人の情報の確認状況と出典
  verificationStatus?: VerificationStatus
  sources?: Source[]

  // 所属状態。未指定は "current"。元メンバーも個人の芸歴情報は保持する（脱退で芸歴はリセットしない）。
  membershipStatus?: MembershipStatus
  leftYear?: number | null
}

export type MembershipStatus = "current" | "former"

// 出典の優先順位（docs/data-policy.md）
// A 一次情報: agency_official, school_official, award_official, official_interview
// B 補助・照合: news, interview, wikipedia
// C 候補発見用: secondary_database
export type SourceType =
  | "agency_official"
  | "school_official"
  | "award_official"
  | "official_interview"
  | "news"
  | "interview"
  | "wikipedia"
  | "secondary_database"

export type Source = {
  title: string
  url: string
  // 出典を参照した日
  checkedAt?: string
  type?: SourceType
  // この出典が根拠となる項目名（例: ["careerStartYear", "school", "schoolGeneration"]）。
  // 新規データでは原則記載する。既存データは未設定。
  fields?: string[]
}
