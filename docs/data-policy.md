# 芸人データ ポリシー

## データの流れ

```text
data/geireki-matome.seed.json   ← 唯一の元データ（single source of truth）
        ↓ npm run data:import（scripts/import-comedians.mjs）
data/comedians.ts               ← 生成物。直接編集しない
        ↓
Next.js UI
```

- 修正・追加は必ず seed JSON に対して行い、`npm run data:import` で再生成する。
- `data/comedians.ts` を手編集すると、次回の再生成で消える。`npm run data:validate` は seed から再生成した内容と一致しない場合に ERROR を出す。
- データを変更したら `npm run data:validate` を実行し、ERROR が 0 件であることを確認する。ERROR がある間は import も書き出しを行わない。

## debutYear（芸歴開始年）

- **その人物が芸人として活動を開始した年**。個人（seed の `people[]`）の値が正。
- 現在の値の多くは二次情報源（geireki-matome.net の編集上の芸歴年）で、公式未確認。`debutYearStatus: "secondary_source"` とする。
- `debutType` は「何をもって芸歴開始としたか」。根拠がない限り推定しない。
  - 養成所出身でも `school_graduation`（養成所卒業）とは限らないため、`school` の有無から推定しない。
  - geireki-matome.net 由来の年は `secondary_source_editorial`、根拠不明は `unknown`。

## formationYear（結成年）との違い

- `formationYear` はコンビ・トリオ等の結成年で、`debutYear` とは別物（`debutYear ≠ formationYear` が前提）。
- 結成年から個人の芸歴開始年を推定しない。逆も同様。

## メンバー間で芸歴開始年が異なるグループ

- グループは常に1エントリとして扱い、メンバーごとの年は `members[].debutYear` に保持する。
- グループの `debutYear` は、メンバー全員の年が判明していて一致する場合のみ設定する。
  - 異なる場合は `null`（`mixedMemberDebutYears: true`）。最古メンバーの年を自動採用しない。
  - 一部メンバーの年が不明な場合も `null`（`mixedMemberDebutYears: null`）。
- UI では、こうしたグループをメンバーごとの年で年別一覧・前後の芸人に表示し、グループ単位での芸歴比較は行わない。

## 「同期」と「同年デビュー」

- 芸歴開始年が同じだけの場合は **「同年デビュー」** と表記する。
- 「同期」は養成所の同期など明示的な根拠がある場合に限る（将来の別機能）。

## 芸歴の比較表現

- 「AはBの先輩」と断定せず、**「芸歴上、Aがn年先」** と表記する。
- `debutYear` が `null` の芸人は比較せず、理由（メンバーごとに異なる／不明）を表示する。

## 不明値

- 不明な値を推測で埋めない。seed では `null` とし、UI では「不明」と表示する（「該当なし」と断定しない）。
- 例: ハライチの岩井勇気、相席スタートの山﨑ケイは、メンバー構成のみ補完し、芸歴開始年・生年月日・養成所・出典は `null`（未調査）。

## 出典の扱い

- `sources[].type` で出典の種類を区別する。
  - 公式情報源: `agency_official`（事務所公式）, `school_official`, `award_official`
  - 二次情報源: `secondary_database`（geireki-matome.net 等）, `wikipedia`, `news`
- `checkedAt` は出典を参照した日で、公式に確認した日ではない。
- `verificationStatus` で検証状況を管理する。seed 初版の `unverified_secondary_source` は import 時に `extracted_secondary` として扱う。
  - `candidate_unverified`: 候補（根拠未確認） / `extracted_secondary`: 二次情報源から抽出 / `official_single_source`: 公式情報源1件で確認 / `verified_multi_source`: 複数情報源で確認 / `conflict_needs_review`: 情報源間で矛盾 / `manual_verified`: 人手で確認済み
- 二次情報源のみ、またはサイトのトップページURLのみの出典は validate で WARNING になる。可能な限り個別ページ・公式情報源を追加する。

## id / slug

- 既存エントリの id / slug（`group-0030`, `person-0107` など）は URL として公開済みのため変更しない。
- 以前メンバー個人単位で登録していた芸人の URL（`/comedians/person-xxxx`）は、そのメンバーが所属するグループのページへリダイレクトする（`members[].id` を使用）。
- 新規追加時の方針:
  - `id` は既存の連番に続けて採番し、再利用・振り直しをしない（`group-0075`, `person-0165`, …）。
  - 人間可読な URL を使う場合は seed に `slug` を明示する（例: `"slug": "bananaman"`。ローマ字・小文字・ハイフン区切り）。一度公開した slug は変更しない。
  - slug が未指定なら id を slug として使う。
