import Link from "next/link"

export default function NotFound() {
  return (
    <div className="bg-washi border-b border-line">
      <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-24 text-center">
        <p className="font-display text-7xl text-shu">404</p>
        <h1 className="mt-4 font-display text-2xl">ページが見つかりませんでした</h1>
        <p className="mt-3 text-sm text-muted">
          URLが間違っているか、ページが移動した可能性があります。
        </p>
        <Link
          href="/"
          className="mt-8 rounded-full bg-ink px-6 py-3 text-sm font-bold text-paper transition-colors hover:bg-shu"
        >
          トップへ戻る
        </Link>
      </div>
    </div>
  )
}
