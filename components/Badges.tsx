import type { CareerStartYearStatus, Comedian } from "@/types/comedian"
import { CAREER_START_YEAR_STATUS_LABELS } from "@/lib/careerStart"
import { STATUS_TONE, getKindLabel } from "@/lib/display"

export function KindBadge({ comedian }: { comedian: Comedian }) {
  return (
    <span className="inline-flex items-center rounded-full border border-ink/15 px-2 py-0.5 text-[11px] font-medium text-ink-soft">
      {getKindLabel(comedian)}
    </span>
  )
}

export function StatusBadge({ status }: { status?: CareerStartYearStatus }) {
  const key = status ?? "unknown"
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_TONE[key]}`}
    >
      {CAREER_START_YEAR_STATUS_LABELS[key]}
    </span>
  )
}
