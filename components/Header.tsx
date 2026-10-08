import Link from "next/link"

const NAV = [
  { href: "/timeline", label: "タイムライン", mobile: true },
  { href: "/compare", label: "比較", mobile: true },
  { href: "/about", label: "このサイトについて", mobile: false },
]

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-shu font-display text-lg text-white shadow-sm transition-transform group-hover:-rotate-6">
            芸
          </span>
          <span className="whitespace-nowrap font-display text-lg tracking-wide sm:text-xl">芸歴DB</span>
        </Link>
        <nav className="flex items-center gap-0.5 text-xs sm:gap-1 sm:text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-2.5 py-1.5 text-ink-soft transition-colors hover:bg-ink hover:text-paper sm:px-3 ${
                item.mobile ? "" : "hidden sm:inline-flex"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
