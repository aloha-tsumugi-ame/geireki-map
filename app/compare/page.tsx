import type { Metadata } from "next"
import { getAllComedians, getComedian } from "@/lib/getComedian"
import CompareSelectors from "@/components/CompareSelectors"
import CompareCard from "@/components/CompareCard"

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
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold text-center">芸人を比較する</h1>
      <p className="mt-2 text-sm text-neutral-500 text-center">
        2組の芸人を選ぶと、芸歴上どちらが先か表示されます
      </p>

      <div className="mt-8">
        <CompareSelectors comedians={comedians} first={first} second={second} />
      </div>

      <div className="mt-8">
        {a && b ? (
          <CompareCard a={a} b={b} />
        ) : (
          <p className="text-sm text-neutral-400 text-center">
            2組の芸人を選択してください
          </p>
        )}
      </div>
    </div>
  )
}
