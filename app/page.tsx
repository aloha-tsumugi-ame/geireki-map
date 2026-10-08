import ComedianSearch from "@/components/ComedianSearch"
import ComedianCard from "@/components/ComedianCard"
import { getAllComedians } from "@/lib/getComedian"

const POPULAR_SLUGS = [
  "group-0054", // 千鳥
  "group-0006", // かまいたち
  "group-0069", // 霜降り明星
  "group-0030", // ダウンタウン
  "group-0067", // 銀シャリ
]

export default function Home() {
  const comedians = getAllComedians()
  const popular = POPULAR_SLUGS.map((slug) =>
    comedians.find((c) => c.slug === slug)
  ).filter((c): c is NonNullable<typeof c> => Boolean(c))

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <section className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          芸人の「先輩・後輩」が一目でわかる
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          芸人名を検索して、芸歴開始年や芸歴上の前後の芸人を探索しましょう
        </p>

        <div className="mt-6 max-w-md mx-auto">
          <ComedianSearch />
        </div>
      </section>

      <section className="mt-16 rounded-xl border border-black/10 p-6">
        <h2 className="text-lg font-semibold text-center">芸人を比較する</h2>
        <p className="mt-1 text-xs text-neutral-500 text-center">
          2組の芸人を選んで芸歴を比較できます
        </p>
        <div className="mt-4 flex justify-center">
          <a
            href="/compare"
            className="inline-block rounded-lg bg-black text-white px-6 py-2.5 text-sm font-medium hover:bg-neutral-800"
          >
            比較ページへ
          </a>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-lg font-semibold">人気の芸人</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {popular.map((comedian) => (
            <ComedianCard key={comedian.id} comedian={comedian} />
          ))}
        </div>
      </section>
    </div>
  )
}
