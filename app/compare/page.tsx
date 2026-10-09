import type { Metadata } from "next"
import { Suspense } from "react"
import CompareView from "@/components/CompareView"
import PageHeader from "@/components/PageHeader"

export const metadata: Metadata = {
  title: "芸人を比較する",
  description: "2組の芸人の芸歴を比較できます。",
}

export default function ComparePage() {
  return (
    <div>
      <PageHeader
        eyebrow="COMPARE"
        title="芸人を比較する"
        description="芸人を2人（2組）選ぶと、芸歴開始年をもとに芸歴上どちらが何年先輩かを表示します。コンビのメンバー個人どうしでも比較できます。"
      />

      <div className="mx-auto max-w-3xl space-y-8 px-4 pt-10">
        <Suspense fallback={null}>
          <CompareView />
        </Suspense>
      </div>
    </div>
  )
}
