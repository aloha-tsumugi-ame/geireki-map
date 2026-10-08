import Link from "next/link"
import type { Comedian } from "@/types/comedian"
import { yearEntryKey, type YearEntry } from "@/lib/careerStart"

export default function CareerTimeline({
  entries,
  undated = [],
  highlightId,
}: {
  entries: YearEntry[]
  // 芸歴開始年が不明で年に配置できない芸人
  undated?: Comedian[]
  highlightId?: string
}) {
  const years = Array.from(new Set(entries.map((e) => e.year))).sort(
    (a, b) => a - b
  )
  const decades = Array.from(new Set(years.map((y) => Math.floor(y / 10) * 10)))

  const chipClass = (comedian: Comedian) =>
    comedian.id === highlightId
      ? "border-shu bg-shu text-white"
      : "border-line bg-card hover:border-ink hover:bg-ink hover:text-paper"

  return (
    <div className="space-y-14">
      {decades.map((decade) => (
        <section key={decade} id={`decade-${decade}`} className="scroll-mt-24">
          <h2 className="flex items-baseline gap-3 border-b-2 border-ink pb-2">
            <span className="font-display text-3xl">{decade}</span>
            <span className="text-sm font-bold text-muted">年代</span>
          </h2>

          <ol className="timeline-rail mt-6 space-y-6">
            {years
              .filter((year) => Math.floor(year / 10) * 10 === decade)
              .map((year) => {
                const group = entries
                  .filter((e) => e.year === year)
                  .sort((a, b) => a.comedian.name.localeCompare(b.comedian.name, "ja"))

                return (
                  <li
                    key={year}
                    id={`year-${year}`}
                    className="relative grid scroll-mt-24 gap-3 pl-8 sm:grid-cols-[6rem_1fr] sm:gap-6"
                  >
                    <span className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-[3px] border-paper bg-shu ring-2 ring-shu/30" />
                    <Link
                      href={`/debut/${year}`}
                      className="flex items-baseline gap-2 self-start font-display text-2xl leading-none hover:text-shu"
                    >
                      {year}
                      <span className="whitespace-nowrap font-sans text-[11px] font-bold text-muted">
                        {group.length}組
                      </span>
                    </Link>
                    <ul className="flex flex-wrap gap-2">
                      {group.map((entry) => (
                        <li key={yearEntryKey(entry)}>
                          <Link
                            href={`/comedians/${entry.comedian.slug}`}
                            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${chipClass(entry.comedian)}`}
                          >
                            {entry.comedian.name}
                            {entry.member && (
                              <span className="text-[11px] opacity-70">（{entry.member.name}）</span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                )
              })}
          </ol>
        </section>
      ))}

      {undated.length > 0 && (
        <section id="year-unknown" className="scroll-mt-24">
          <h2 className="flex items-baseline gap-3 border-b-2 border-ink pb-2">
            <span className="font-display text-2xl">芸歴開始年不明</span>
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {undated.map((comedian) => (
              <li key={comedian.id}>
                <Link
                  href={`/comedians/${comedian.slug}`}
                  className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${chipClass(comedian)}`}
                >
                  {comedian.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
