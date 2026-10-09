@AGENTS.md

# 芸歴DB（geireki-map）

芸人の芸歴開始年・芸歴開始年が同じ芸人・芸歴上の前後関係を探索できるサイト。Next.js（App Router）を静的書き出しして GitHub Pages で公開している。

- 公開URL: https://aloha-tsumugi-ame.github.io/geireki-map/
- リポジトリ: https://github.com/aloha-tsumugi-ame/geireki-map（Public）

## データの流れ

```text
data/geireki-matome.seed.json  ← 唯一の元データ（ここだけを編集する）
        ↓ npm run data:import
data/comedians.ts              ← 生成物。直接編集しない
        ↓
UI（app/, components/, lib/）
```

- データの意味・ルールは `docs/data-policy.md` が正。データを触る前に必ず読む。
- seed を変えたら `npm run data:import` → `npm run data:validate`。ERROR が1件でもあれば完了にしない。

## コマンド

| 目的 | コマンド |
|---|---|
| seed → comedians.ts 生成 | `npm run data:import` |
| データ検証（`--verbose` で全件） | `npm run data:validate` |
| 型チェック | `npx tsc --noEmit --incremental false`（`tsconfig.tsbuildinfo` を書き換えないため） |
| Lint | `npm run lint` |
| ビルド（Pages と同じ形） | `PAGES_BASE_PATH=/geireki-map npm run build` → `out/` |
| ローカル確認 | `npm start`（`out/` を配信）。basePath 付きで確認するなら `out` を `geireki-map/` としてリンクした親ディレクトリを静的配信する |

`next dev` は AGENTS.md の自動ブロックを書き換えることがある（その差分はコミットしてよい）。

## データのルール（要点。詳細は docs/data-policy.md）

- **芸歴開始年（careerStartYear）= プロの芸人としてのキャリアが始まった年**。根拠は `careerStartBasis` で区別する。
  - 養成所出身: 在籍期間は含めず卒業・プロ活動開始の年（`school_graduation`）。NSC○期からの計算は禁止。
  - 弟子入り型: 入門年（`apprenticeship`）。
  - コンビ結成・解散・ピン転向・脱退で芸歴をリセットしない。`formationYear` とは別概念で、相互に推定しない。
- **推測で値を埋めない。** 根拠がなければ `null` / `unknown`。Web 調査の指示がないときは調査しない。ユーザーが渡す「人間レビュー済み確定データ」は値を変えずにそのまま使う。
- グループの `careerStartYear` は、現在メンバー全員の年が一致するときだけ設定（異なれば `null` + `mixedMemberCareerStartYears: true`）。最古メンバーの年を代表値にしない。
- 元メンバーは `membershipStatus: "former"` + `leftYear`。グループ単位の計算には現在メンバーだけを使う。
- 確認状況: `careerStartYearStatus`（年そのもの）と `verificationStatus`（その人物・グループの情報全体）は別物。二次情報を `confirmed` に勝手に昇格させない。出典間で矛盾したら多数決せず `conflict_needs_review`。
- 出典: `sources[].fields` には、そのページで実際に裏付けられる項目だけを書く。URL の追跡用パラメータ（`utm_*` など）は外す。
- 養成所名は「NSC東京校」「NSC大阪校」の表記に統一する（「東京NSC」「大阪NSC」は使わない）。
- 既存データを、別の依頼のついでに直さない。

## 新しい芸人を追加するとき

1. seed で名前・別名・slug の重複を確認する。
2. id は既存の最大値の続き（`group-NNNN` / `person-NNNN`）。ページを持つレコード（グループ・ピン）は**人間可読の slug を明示**（小文字の kebab-case、自動採番形式は不可、公開後は変更しない）。既存の id 形式の slug は変えない。
3. グループは `groups[]` に1件、メンバーは `people[]`（`group` にグループ名）。ピン芸人は `people[]` で `group: null`。
4. `npm run data:import` → `npm run data:validate`（ERROR 0）→ 型チェック・lint・ビルド。既存件数が変わっていないことも確認する。
5. 新規の WARNING は消すために値をいじらず、「情報不足／fields の設定不足／validation ルールの問題」に分類して報告する。

## UI の用語

- 「デビュー年」ではなく「芸歴開始」「芸歴開始年」。芸歴開始年が同じだけなら「芸歴開始年が同じ芸人」（「同期」は使わない）。
- 比較ページは「芸歴上、Aがn年先輩です」（必ず「芸歴上」を付ける）。前後の芸人一覧は「芸歴上n年先／n年後」。
- 比較はグループ・ピン芸人に加えてメンバー個人でもできる（URL の値はメンバーの person id）。

## 静的書き出し（GitHub Pages）の制約

- `next.config.ts` は `output: "export"`。サーバー機能（リクエスト時のレンダリング、リダイレクト、cookies 等）は使えない。
- 動的ルートは `generateStaticParams` + `dynamicParams = false`。旧URL（`/comedians/person-xxxx`）は meta refresh の静的ページで転送している。
- 比較ページのクエリは `useSearchParams` でブラウザ側で読む。
- サブパス配信のため、リンクは `next/link` を使う（素の `<a href="/...">` は basePath が付かない）。

## Git・公開の運用

- 作業は `prepare-data-model` ブランチでコミットする。`main` は push すると GitHub Actions（`.github/workflows/deploy-pages.yml`）で自動公開されるため、**ユーザーの指示があるときだけ** `main` に統合して push する。
- コミットの作成者メールは GitHub の noreply アドレス（このリポジトリの `git config user.email` に設定済み）。仕事用メールを履歴に入れない。
- 過去のコミットを amend / rebase しない。
- `backup/before-email-rewrite` はローカル専用のバックアップ。push しない。
