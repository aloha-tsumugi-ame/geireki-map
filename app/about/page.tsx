import type { Metadata } from "next"
import PageHeader from "@/components/PageHeader"

export const metadata: Metadata = {
  title: "このサイトについて",
  description: "芸歴DBの目的と、芸歴開始年の定義について説明します。",
}

const CAREER_PATHS = [
  {
    label: "養成所出身",
    rule: "養成所の在籍期間は含めず、卒業・プロ活動開始の年",
  },
  {
    label: "弟子入り・入門",
    rule: "落語家など、師匠に弟子入り・入門した年",
  },
  {
    label: "その他",
    rule: "プロの芸人として活動を始めたことが確認できる最初の年",
  },
]

export default function AboutPage() {
  return (
    <div>
      <PageHeader
        eyebrow="ABOUT"
        title="このサイトについて"
        description="芸歴DBは、芸人名を起点に「芸歴開始年・芸歴上の前後関係・芸歴上の位置」を直感的に探索できるサービスです。"
      />

      <div className="mx-auto max-w-3xl space-y-10 px-4 pt-10 text-sm leading-relaxed text-ink-soft">
        <section>
          <h2 className="border-b-2 border-ink pb-2 font-display text-2xl text-ink">芸歴の基準</h2>
          <p className="mt-4">
            本サイトでは、各芸人の「芸歴開始年」＝<strong className="text-ink">プロの芸人としてのキャリアが始まった年</strong>
            を基準にしています。
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {CAREER_PATHS.map((path) => (
              <div key={path.label} className="rounded-2xl border border-line bg-card p-4">
                <p className="text-xs font-bold text-shu">{path.label}</p>
                <p className="mt-2 text-ink">{path.rule}</p>
              </div>
            ))}
          </div>
          <p className="mt-5">
            芸歴開始年の差は「芸歴上n年先」のように表示し、芸歴開始年が同じ芸人は「芸歴開始年が同じ芸人」として表示します。
            養成所の同期など、明示的な根拠のある「同期」とは区別しています。
          </p>
          <p className="mt-3">
            コンビ・トリオの結成年は芸歴開始年とは別に扱い、コンビの結成・解散やピン転向で個人の芸歴はリセットしません。
            メンバーごとに芸歴開始年が異なるグループは、グループとしての芸歴開始年を設定せず、メンバーごとの年を表示します。
          </p>
          <p className="mt-3 rounded-2xl bg-paper-deep px-4 py-3 text-xs">
            これは本サイト独自の定義であり、実際の芸能界における先輩・後輩関係（初対面の順序や事務所内の慣習など）を
            断定するものではありません。あくまで芸歴年数を比較するための目安としてご利用ください。
          </p>
        </section>

        <section>
          <h2 className="border-b-2 border-ink pb-2 font-display text-2xl text-ink">データについて</h2>
          <p className="mt-4">
            掲載している芸人データの多くは二次情報源をもとに作成しており、公式情報による確認は済んでいません。
            各芸人の芸歴開始年には確認状況（確認済み・二次情報源の値など）を表示しています。
          </p>
          <p className="mt-3">
            根拠が確認できない項目は推測で補わず「不明」と表示しています。誤りが含まれる可能性があるため、
            お気づきの点があれば各芸人詳細ページに記載の出典情報とあわせてご確認ください。
          </p>
        </section>
      </div>
    </div>
  )
}
