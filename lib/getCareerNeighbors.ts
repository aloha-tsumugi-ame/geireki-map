import { getYearEntriesByYear, type YearEntry } from "@/lib/careerStart"

export type CareerNeighborGroup = {
  offset: number
  entries: YearEntry[]
}

// 芸歴開始年 year の前後 range 年に芸歴を開始した芸人。excludeId の芸人自身は除く。
export function getCareerNeighbors(
  year: number,
  excludeId: string,
  range = 2
): CareerNeighborGroup[] {
  const groups: CareerNeighborGroup[] = []

  for (let offset = -range; offset <= range; offset++) {
    if (offset === 0) continue

    const matches = getYearEntriesByYear(year + offset, excludeId)

    if (matches.length > 0) {
      groups.push({ offset, entries: matches })
    }
  }

  return groups.sort((a, b) => a.offset - b.offset)
}
