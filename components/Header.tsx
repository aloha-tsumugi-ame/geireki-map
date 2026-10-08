import Link from "next/link"

export default function Header() {
  return (
    <header className="border-b border-black/10 bg-white/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight">
          芸歴DB
        </Link>
        <nav className="flex gap-4 text-sm text-neutral-600">
          <Link href="/timeline" className="hover:text-black">
            タイムライン
          </Link>
          <Link href="/compare" className="hover:text-black">
            比較
          </Link>
          <Link href="/about" className="hover:text-black">
            このサイトについて
          </Link>
        </nav>
      </div>
    </header>
  )
}
