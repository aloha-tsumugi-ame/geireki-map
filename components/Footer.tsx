import Link from "next/link"

export default function Footer() {
  return (
    <footer className="mt-24 bg-ink text-paper/80">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 text-xs leading-relaxed sm:grid-cols-[1fr_auto]">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-shu font-display text-sm text-white">
              芸
            </span>
            <span className="font-display text-base text-paper">芸歴DB</span>
          </div>
          <p className="mt-4 max-w-xl">
            本サイトの芸歴の前後関係の表示は、各芸人の芸歴開始年を基準にした本サイト独自の目安です。
            実際の芸能界における先輩・後輩関係を断定するものではありません。
          </p>
        </div>
        <nav className="flex gap-6 sm:flex-col sm:gap-2 sm:text-right">
          <Link href="/timeline" className="hover:text-paper">タイムライン</Link>
          <Link href="/compare" className="hover:text-paper">比較</Link>
          <Link href="/about" className="hover:text-paper">このサイトについて</Link>
        </nav>
      </div>
      <div className="border-t border-paper/10 py-4 text-center text-[11px] text-paper/50">
        © 芸歴DB
      </div>
    </footer>
  )
}
