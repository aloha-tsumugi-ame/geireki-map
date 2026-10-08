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

## スキーマバージョンとレガシーレコード

- seed の `metadata.schemaVersion` は現在 `3`（schemaVersion 3 で `debutYear` 系を `careerStartYear` 系に改名）。validate は対応外のバージョンを ERROR にする。
- `metadata.legacyRecords`（`group-0001`〜`group-0074` / `person-0001`〜`person-0164`）の範囲内の id は、schemaVersion 2 以前から存在する**レガシーレコード**。
  - 公開済み URL を守るため slug は id のまま維持し、新規レコード向けの必須ルール（明示 slug など）を免除する。
  - レガシーレコード由来の WARNING は validate で件数のみ表示する（`--verbose` で全件）。
- それ以外の id はすべて**新規レコード**として、本ポリシーのルールを満たす必要がある。

## 芸歴の定義（careerStartYear）

このサービスの比較基準は単純な「デビュー年」ではなく、**芸人としてのキャリア（芸歴）が開始した年** = `careerStartYear` とする。

### 基本原則

- **芸歴は、原則としてプロの芸人として活動を開始した時点から数える。**
- 個人（seed の `people[]`）の値が正。グループの値はその集約。

### キャリア経路ごとのルール

| 経路 | 芸歴開始年 | `careerStartBasis` |
|---|---|---|
| A. 養成所出身 | **NSC等の養成所在籍期間は原則として芸歴に含めず、卒業・プロ活動開始後を芸歴1年目とする。** | `school_graduation` |
| B. 弟子入り・入門型 | **弟子入り・入門型では、弟子入り・入門年を芸歴開始年とする。**（初舞台年へずらさない。例: 笑福亭鶴瓶 1972、明石家さんま 1974） | `apprenticeship` |
| C. 養成所・弟子入りを経由しない | プロの芸人として活動を開始したことが確認できる最初の年 | `professional_debut`（公式等で明記されたプロデビュー） / `first_stage`（初舞台） / `professional_activity`（その他、プロとしての活動開始が明確） |
| D. インディーズ活動 | 事務所所属前でも、芸人として継続的に活動していたことが信頼できる出典で明確な場合はその開始年 | `indie_activity` |

- D について、大学のお笑いサークル・学生大会への出場・趣味としての漫才などを自動的に芸歴へ含めない。プロまたは芸人としての継続的活動だったことが確認できる場合だけ採用する。
- 既存の geireki-matome.net 等の二次情報による芸歴年は `secondary_source_editorial`、根拠となる開始地点が確認できない場合は `unknown`。

### NSC期

- **NSC○期という情報だけから芸歴開始年を自動計算しない。**（例:「NSC大阪26期 → 2004年」のような変換は禁止）
- 「1994年 NSC大阪校14期」のような記載だけで、その年が入学年・卒業年・プロ活動開始年のどれか判断できない場合は `careerStartYear: null` / `careerStartBasis: "unknown"` とする。
- 吉本興業の公式プロフィールの「出身/入社/入門」欄は、NSC 出身者では入学年等を示しており、それだけでは芸歴開始年の根拠にしない。弟子入り型で「○年 入門」と明記されている場合は B の根拠になる。

### コンビ結成

- **コンビ結成年は芸歴開始年とは別に管理し、結成・解散・再結成・ピン転向で個人の芸歴をリセットしない。**
  - 例: 芸人として活動開始 1995年、現在のコンビ結成 2001年 → `careerStartYear: 1995` / `formationYear: 2001`
- `formationYear` から `careerStartYear` を推定しない。逆も同様。
- 現在の芸名・形態での活動開始年（例: ピン転向年）を芸歴開始年としない。

### 不明値

- **根拠が確認できない場合は推測せず null とする。**（`careerStartYear: null` / `careerStartYearStatus: "unknown"` / `careerStartBasis: "unknown"`）
- `careerStartYear` に使えるのは「デビュー」「芸人として活動開始」「初舞台」「入門」等が年とともに**本文に明記**されている場合のみ。Wikipedia のインフォボックス「活動時期」は定義が示されていないため根拠にしない。

### careerStartYearStatus（確認状況）

- `confirmed`: A・B ランクの出典で確認済み / `secondary_source`: 二次情報源の値（未確認） / `estimated`: 推定値 / `unknown`: 不明
- seed に明示が無い場合、年があれば `secondary_source`、無ければ `unknown` として生成する（自動で `confirmed` にはしない）。新規データでは明示する。
- 新規データでの判定の目安: A ランクの出典に芸歴開始年が明記 → `confirmed`。B ランク（Wikipedia・報道等）にのみ明記 → `secondary_source`。C ランクにしか無い → 登録しない（`null` / `unknown`）。
- `careerStartBasis` が `unknown` / `secondary_source_editorial` の年を `confirmed` にしない（validate で ERROR）。
- 個人の `verificationStatus` の目安（新規データ）: A ランクの出典で確認 → `official_single_source`。A に加えて独立した別の出典（A・B）でも `careerStartYear` が一致 → `verified_multi_source`。B のみ → `extracted_secondary`。根拠となる出典が無い → `candidate_unverified`。

### 既存データ（レガシー）の扱い

- 既存の geireki-matome.net 由来の芸歴年は再調査・再計算せず、そのまま `careerStartYear` とし、`careerStartBasis: "secondary_source_editorial"` / `careerStartYearStatus: "secondary_source"` とする。
- 出典が geireki-matome.net 以外（吉本公式プロフィール・Wikipedia）のレガシー9件は、年の根拠が分からないため `careerStartBasis: "unknown"`（値はそのまま）。
- これらの値は本ポリシーの定義（養成所卒業後を1年目とする等）で検証されたものではない。

## メンバー間で芸歴開始年が異なるグループ

- グループは常に1エントリとして扱い、メンバーごとの年は `members[].careerStartYear` に保持する。
- グループの `careerStartYear` は、メンバー全員の年が判明していて一致する場合のみ設定する。
  - 異なる場合は `null`（`mixedMemberCareerStartYears: true`）。最古メンバーの年を自動採用しない。
  - 一部メンバーの年が不明な場合も `null`（`mixedMemberCareerStartYears: null`）。
- UI では、こうしたグループをメンバーごとの年で年別一覧・前後の芸人に表示し、グループ単位での芸歴比較は行わない。

## 元メンバー（membershipStatus）

- グループの `members` には過去メンバーを保持できる。`membershipStatus: "current"` / `"former"` で区別する（未指定は `current`）。元メンバーは `leftYear`（脱退年）を記録する。
- 芸歴はグループ脱退によってリセットしない。元メンバーも個人の `careerStartYear` を保持する。
- グループ単位の `careerStartYear`・`mixedMemberCareerStartYears`・養成所などの判定には現在メンバー（`current`）のみを使用する。
- UI では現在メンバーと元メンバーを分けて表示し、検索では元メンバー名からもグループに到達できるようにする。

## 「同期」と「芸歴開始年が同じ」

- 芸歴開始年が同じだけの場合は **「芸歴開始年が同じ芸人」** と表記する（「同年デビュー」とは書かない）。
- 「同期」は養成所の同期など明示的な根拠がある場合に限る（将来の別機能）。
- ユーザー向けの表記は「デビュー年」ではなく「芸歴開始」「芸歴開始年」とする。

## 芸歴の比較表現

- 「AはBの先輩」と断定せず、**「芸歴上、Aがn年先」** と表記する。
- `careerStartYear` が `null` の芸人は比較せず、理由（メンバーごとに異なる／不明）を表示する。

## 不明値

- 不明な値を推測で埋めない。seed では `null` とし、UI では「不明」と表示する（「該当なし」と断定しない）。
- 例: ハライチの岩井勇気、相席スタートの山﨑ケイは、メンバー構成のみ補完し、芸歴開始年・生年月日・養成所・出典は `null` / 空（未調査）。
- `status`（活動状況）も、公式プロフィール等で確認できた場合のみ `active` / `inactive` / `disbanded` を設定する。seed に明示が無ければ `unknown`。

## 確認状況（verificationStatus）

- 値: `candidate_unverified`（候補・根拠未確認） / `extracted_secondary`（二次情報源から抽出） / `official_single_source`（公式情報源1件で確認） / `verified_multi_source`（複数情報源で確認） / `conflict_needs_review`（情報源間で矛盾） / `manual_verified`（人手で確認済み）
- **個人（`people[]` → ピン芸人 / `members[]`）**: その人物の情報（芸歴開始年・養成所など）の確認状況。
- **グループ（`groups[]`）**: グループ自体の情報（存在・メンバー構成・所属・結成年など）の確認状況。メンバーの確認状況からは導出しない。
  - 例: 「東京03というグループの存在・所属・結成年」と「豊本明長の芸歴開始年」は別の確認対象。
- schemaVersion 1 の旧値 `unverified_secondary_source` は `extracted_secondary` に移行済み。旧値が入った場合は validate が ERROR にする。

## 出典（sources）

### 優先順位

| ランク | 用途 | `type` | 例 |
|---|---|---|---|
| A | 一次情報として優先 | `agency_official`, `school_official`, `award_official`, `official_interview` | 所属事務所の公式プロフィール、NSC・養成所の公式情報、賞レース公式サイト、本人・所属事務所による公式インタビュー |
| B | 補助・照合 | `news`, `interview`, `wikipedia` | 大手報道機関、信頼できるインタビュー記事、Wikipedia |
| C | 候補発見用 | `secondary_database` | geireki-matome.net、その他まとめサイト |

- C だけを根拠に `careerStartYearStatus: "confirmed"` や `verificationStatus: "verified_multi_source"` へ昇格させない（validate で ERROR）。
- `official_single_source` には A ランクの出典が必要（無ければ WARNING）。`verified_multi_source` には出典が2件以上必要（1件以下なら WARNING）。

### 矛盾した場合

- 複数の出典で `careerStartYear` が食い違った場合、**多数決で決めない**。
- その人物は `verificationStatus: "conflict_needs_review"`、`careerStartYear: null`、`careerStartYearStatus: "unknown"` とし、**解決するまで芸歴比較から除外する**（`conflict_needs_review` なのに `careerStartYear` がある場合は validate で ERROR）。
- 食い違っている各出典は `sources` に残し、どの値だったかを `note` に記録する。

### fields（その出典が何の根拠か）

- `sources[].fields` に、その出典が根拠となるフィールド名を記録する。グループの `sources` も、個人（`members` / ピン芸人）の `sources` も同様。
  - グループの例: `["agency", "members", "formationYear"]`
  - 個人の例: `["careerStartYear", "school", "schoolGeneration"]`
- 新規データでは原則記載する（空なら WARNING。新規レコードで `careerStartYear` があるのに `fields` に `"careerStartYear"` を含む出典が無い場合も WARNING。旧名 `"debutYear"` は ERROR）。
- 既存データには無理に追加しない（根拠が分からないため）。

### その他

- `checkedAt` は出典を参照した日で、公式に確認した日ではない。
- 個別ページではなくサイトのトップページ URL だけの出典や、A ランクの出典が無いエントリは validate で WARNING になる。

## id / slug

### 既存レコード（レガシー）

- 既存エントリの id / slug（`group-0030`, `person-0107` など）は URL として公開済みのため変更しない（変えると validate で ERROR）。
- 以前メンバー個人単位で登録していた芸人の URL（`/comedians/person-xxxx`）は、そのメンバーが所属するグループのページへリダイレクトする（`members[].id` を使用）。

### 新規レコード

- ページを持つレコード（グループ・ピン芸人）は、seed に **`slug` を明示する**。自動生成して保存しない。
  - 小文字 ASCII、kebab-case（`^[a-z0-9]+(-[a-z0-9]+)*$`）
  - id とは独立させ、自動採番形式（`group-0075` など）は使わない
  - 一度公開したら原則変更しない
  - 例: `tokyo-03`, `beat-takeshi`, `akashiya-sanma`, `football-hour`
- `id` は内部識別子。レガシー範囲と重複しない値を使い、再利用・振り直しをしない（例: `group-0075`, `person-0165` と続ける）。
- グループのメンバー（`people[]` で `group` があるもの）は個人ページを持たないため slug は任意。付ける場合は同じ形式にする。

### 新規レコードの例

groups[]:

```json
{
  "id": "group-0075",
  "slug": "tokyo-03",
  "name": "東京03",
  "members": ["飯塚悟志", "豊本明長", "角田晃広"],
  "agency": "（出典で確認した所属事務所）",
  "formationYear": null,
  "status": "active",
  "verificationStatus": "official_single_source",
  "sources": [
    {
      "title": "（所属事務所の公式プロフィールのタイトル）",
      "url": "https://...",
      "type": "agency_official",
      "checkedAt": "YYYY-MM-DD",
      "fields": ["members", "agency", "status"]
    }
  ]
}
```

people[]（メンバー）:

```json
{
  "id": "person-0166",
  "slug": null,
  "name": "豊本明長",
  "group": "東京03",
  "careerStartYear": null,
  "careerStartYearStatus": "unknown",
  "careerStartBasis": "unknown",
  "birthDate": null,
  "school": null,
  "schoolGeneration": null,
  "schoolEquivalent": null,
  "verificationStatus": "candidate_unverified",
  "sources": []
}
```

- `memberCareerStartYears` / `mixedMemberCareerStartYears` は任意（書く場合は people[] の値と一致している必要がある）。
- 値は形式の説明用。実際の値は出典で確認したものだけを記載する。
