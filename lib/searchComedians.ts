import { comedians } from "@/data/comedians"
import { normalizeSearchText } from "@/lib/normalizeSearchText"
import type { Comedian } from "@/types/comedian"

type SearchIndexItem = {
  comedian: Comedian
  // 芸人名・読み・別名
  primaryKeys: string[]
  // メンバー名・メンバーの読み
  memberKeys: string[]
}

const normalizeAll = (values: (string | undefined)[]) =>
  values.filter((v): v is string => Boolean(v)).map(normalizeSearchText)

const searchIndex: SearchIndexItem[] = comedians.map((comedian) => ({
  comedian,
  primaryKeys: normalizeAll([
    comedian.name,
    comedian.nameKana,
    ...(comedian.aliases ?? []),
  ]),
  memberKeys: normalizeAll(
    (comedian.members ?? []).flatMap((member) => [member.name, member.nameKana])
  ),
}))

// 芸人名・読み・別名に一致したものを先に、メンバー名のみ一致したものを後に返す
export function searchComedians(keyword: string) {
  const normalized = normalizeSearchText(keyword)

  if (!normalized) {
    return []
  }

  const primary: Comedian[] = []
  const byMember: Comedian[] = []

  for (const item of searchIndex) {
    if (item.primaryKeys.some((key) => key.includes(normalized))) {
      primary.push(item.comedian)
    } else if (item.memberKeys.some((key) => key.includes(normalized))) {
      byMember.push(item.comedian)
    }
  }

  return [...primary, ...byMember]
}
