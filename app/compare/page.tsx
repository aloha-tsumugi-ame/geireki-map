import type { Metadata } from "next"
import { getAllComedians, getComedian } from "@/lib/getComedian"
import CompareSelectors from "@/components/CompareSelectors"
import CompareCard from "@/components/CompareCard"
import PageHeader from "@/components/PageHeader"

export const metadata: Metadata = {
  title: "芸人を比較する",
  description: "2組の芸人の芸歴を比較できます。",
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ first?: string; second?: string }>
}) {
  const { first, second } = await searchParams
  const comedians = getAllComedians()

  const a = first ? getComedian(first) : undefined
  const b = second ? getComedian(second) : undefined

  return (
    <div>
      <PageHeader
        eyebrow="COMPARE"
        title="芸人を比較する"
        description="2組の芸人を選ぶと、芸歴開始年をもとに芸歴上どちらが何年先かを表示します。"
      />

      <div className="mx-auto max-w-3xl space-y-8 px-4 pt-10">
        <CompareSelectors comedians={comedians} first={first} second={second} />

        {a && b ? (
          <CompareCard a={a} b={b} />
        ) : (
          <p className="rounded-3xl border-2 border-dashed border-line px-4 py-12 text-center text-sm text-muted">
            2組の芸人を選択してください
          </p>
        )}
      </div>
    </div>
  )
}
