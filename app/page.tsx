import Link from "next/link"
import ComedianSearch from "@/components/ComedianSearch"
import ComedianCard from "@/components/ComedianCard"
import { getAllComedians } from "@/lib/getComedian"
import { getYearEntries } from "@/lib/careerStart"

const FEATURED_SLUGS = [
  "akashiya-sanma",
  "group-0030", // ダウンタウン
  "group-0054", // 千鳥
  "sandwichman",
  "group-0006", // かまいたち
  "group-0069", // 霜降り明星
]

export default function Home() {
  const comedians = getAllComedians()
  const featured = FEATURED_SLUGS.map((slug) =>
    comedians.find((c) => c.slug === slug)
  ).filter((c): c is NonNullable<typeof c> => Boolean(c))

  const years = getYearEntries().map((entry) => entry.year)
  const minYear = Math.min(...years)
  const maxYear = Math.max(...years)
  const decades = Array.from(new Set(years.map((y) => Math.floor(y / 10) * 10))).sort(
    (a, b) => a - b
  )

  return (
    <div>
      <section className="bg-washi relative overflow-hidden border-b border-line">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 hidden h-72 w-72 rotate-12 items-center justify-center rounded-full border-[10px] border-shu/15 font-display text-[9rem] text-shu/10 md:flex"
        >
          芸
        </div>
        <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-14 sm:pt-20">
          <p className="inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1 text-xs font-bold tracking-wider text-paper">
            <span className="h-1.5 w-1.5 rounded-full bg-kin" />
            芸人の芸歴データベース
          </p>
          <h1 className="mt-6 font-display text-4xl leading-tight sm:text-6xl">
            あの芸人、
            <br />
            <span className="relative inline-block">
              <span className="relative z-10">芸歴</span>
              <span className="absolute inset-x-0 bottom-1 -z-0 h-4 bg-kin/60 sm:h-5" />
            </span>
            何年目？
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">
            芸人名で検索すると、芸歴開始年と、同じ年に芸歴を始めた芸人・前後の芸人がわかります。
          </p>

          <div className="mt-8 max-w-2xl">
            <ComedianSearch />
          </div>

          <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
            {[
              { label: "登録数", value: `${comedians.length}`, unit: "組・人" },
              { label: "芸歴開始年", value: `${minYear}–${maxYear}`, unit: "" },
              { label: "年代", value: `${decades.length}`, unit: "年代" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-line bg-card/80 px-4 py-3">
                <dt className="text-[11px] text-muted">{stat.label}</dt>
                <dd className="mt-1 font-display text-lg sm:text-2xl">
                  {stat.value}
                  {stat.unit && <span className="ml-1 font-sans text-xs text-muted">{stat.unit}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-16 px-4 pt-14">
        <section>
          <SectionTitle eyebrow="ERA" title="年代から探す" />
          <div className="mt-5 flex flex-wrap gap-2">
            {decades.map((decade) => (
              <Link
                key={decade}
                href={`/timeline#decade-${decade}`}
                className="rounded-full border-2 border-ink bg-card px-4 py-2 font-display text-sm transition-colors hover:bg-ink hover:text-paper"
              >
                {decade}年代
              </Link>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle eyebrow="PICK UP" title="注目の芸人" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((comedian) => (
              <ComedianCard key={comedian.id} comedian={comedian} />
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl bg-ink text-paper">
          <div className="grid items-center gap-6 p-8 sm:grid-cols-[1fr_auto] sm:p-10">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-kin">COMPARE</p>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl">2組の芸歴を比べる</h2>
              <p className="mt-3 text-sm text-paper/70">
                芸歴開始年をもとに、芸歴上どちらが何年先かを表示します。
              </p>
            </div>
            <Link
              href="/compare"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-shu px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-shu-deep"
            >
              比較ページへ
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-bold tracking-[0.2em] text-shu">{eyebrow}</p>
      <h2 className="mt-1 font-display text-2xl">{title}</h2>
    </div>
  )
}
