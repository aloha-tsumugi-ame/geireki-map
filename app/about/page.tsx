import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "このサイトについて",
  description: "芸歴DBの目的と、芸歴開始年の定義について説明します。",
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 prose-sm">
      <h1 className="text-2xl font-bold">このサイトについて</h1>

      <p className="mt-6 text-sm leading-relaxed text-neutral-700">
        芸歴DBは、芸人名を起点に「芸歴開始年・芸歴上の前後関係・芸歴上の位置」を直感的に探索できるサービスです。
      </p>

      <h2 className="mt-8 text-lg font-semibold">芸歴の基準について</h2>
      <p className="mt-2 text-sm leading-relaxed text-neutral-700">
        本サイトでは、各芸人の「芸歴開始年」＝プロの芸人としてのキャリアが始まった年を基準にしています。
        NSC等の養成所出身者は在籍期間を含めず卒業・プロ活動開始の年、落語家など弟子入り型の芸人は弟子入り・入門の年、
        それ以外はプロの芸人として活動を始めたことが確認できる最初の年です。
        芸歴開始年の差は「芸歴上n年先」のように表示し、芸歴開始年が同じ芸人は「芸歴開始年が同じ芸人」として表示します。
        養成所の同期など、明示的な根拠のある「同期」とは区別しています。
      </p>
      <p className="mt-2 text-sm leading-relaxed text-neutral-700">
        コンビ・トリオの結成年は芸歴開始年とは別に扱い、コンビの結成・解散やピン転向で個人の芸歴はリセットしません。
        メンバーごとに芸歴開始年が異なるグループは、
        グループとしての芸歴開始年を設定せず、メンバーごとの年を表示します。
      </p>
      <p className="mt-2 text-sm leading-relaxed text-neutral-700">
        これは本サイト独自の定義であり、実際の芸能界における先輩・後輩関係（初対面の順序や事務所内の慣習など）を
        断定するものではありません。あくまで芸歴年数を比較するための目安としてご利用ください。
      </p>

      <h2 className="mt-8 text-lg font-semibold">データについて</h2>
      <p className="mt-2 text-sm leading-relaxed text-neutral-700">
        掲載している芸人データの多くは二次情報源をもとに作成しており、公式情報による確認は済んでいません。
        芸歴開始年の根拠が確認できない場合は推測せず「不明」としています。
        誤りが含まれる可能性があります。不明な項目は推測で補わず「不明」と表示しています。
        お気づきの点があれば、各芸人詳細ページに記載の出典情報とあわせてご確認ください。
      </p>
    </div>
  )
}
