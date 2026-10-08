import Link from "next/link"
import type { Comedian } from "@/types/comedian"
import { yearEntryKey, type YearEntry } from "@/lib/debut"

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

  const linkClass = (comedian: Comedian) =>
    comedian.id === highlightId
      ? "font-semibold text-black"
      : "text-neutral-700 hover:text-black"

  return (
    <div className="space-y-8">
      {years.map((year) => {
        const group = entries
          .filter((e) => e.year === year)
          .sort((a, b) => a.comedian.name.localeCompare(b.comedian.name, "ja"))

        return (
          <div key={year} id={`year-${year}`} className="scroll-mt-24">
            <Link
              href={`/debut/${year}`}
              className="text-sm font-semibold text-neutral-500 hover:text-black"
            >
              {year}年
            </Link>
            <ul className="mt-2 space-y-1 border-l border-black/10 pl-4">
              {group.map((entry) => (
                <li key={yearEntryKey(entry)}>
                  <Link
                    href={`/comedians/${entry.comedian.slug}`}
                    className={linkClass(entry.comedian)}
                  >
                    {entry.comedian.name}
                  </Link>
                  {entry.member && (
                    <span className="text-xs text-neutral-400">
                      {" "}
                      （{entry.member.name}）
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )
      })}

      {undated.length > 0 && (
        <div id="year-unknown" className="scroll-mt-24">
          <p className="text-sm font-semibold text-neutral-500">芸歴開始年不明</p>
          <ul className="mt-2 space-y-1 border-l border-black/10 pl-4">
            {undated.map((comedian) => (
              <li key={comedian.id}>
                <Link
                  href={`/comedians/${comedian.slug}`}
                  className={linkClass(comedian)}
                >
                  {comedian.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
