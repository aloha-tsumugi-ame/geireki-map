import type { ReactNode } from "react"

export default function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
}) {
  return (
    <section className="bg-washi border-b border-line">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-14">
        <p className="text-xs font-bold tracking-[0.2em] text-shu">{eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl leading-tight sm:text-5xl">{title}</h1>
        {description && (
          <div className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">{description}</div>
        )}
        {children}
      </div>
    </section>
  )
}
