import { comedians } from "@/data/comedians"

export function getComedian(slug: string) {
  return comedians.find((comedian) => comedian.slug === slug)
}

// 旧個人ページ（/comedians/person-xxxx）のslugから、所属グループを引く
export function getComedianByMemberId(memberId: string) {
  return comedians.find((comedian) =>
    comedian.members?.some((member) => member.id === memberId)
  )
}

export function getAllComedians() {
  return comedians
}
