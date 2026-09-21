import type { ArchiveClassification } from "@/utils/archive"

/**
 * 카테고리 slug의 한국어 표기. 태그는 글쓴이가 자유롭게 붙이므로 번역하지 않고,
 * 연도는 숫자 그대로 쓴다. 매핑이 없는 slug는 원본을 그대로 돌려준다.
 */
const KOREAN_CATEGORY_LABELS: Record<string, string> = {
  algorithm: "알고리즘",
  cloud: "클라우드",
  develop: "개발",
  experience: "경험",
  health: "건강",
  linux: "리눅스",
  network: "네트워크",
  tech: "기술",
  thinking: "생각",
}

export function getKoreanArchiveLabel(classify: ArchiveClassification, label: string): string {
  if (classify !== "category") {
    return label
  }
  return KOREAN_CATEGORY_LABELS[label.toLowerCase()] ?? label
}

/** H1 아래에 한 줄로 노출되는 짧은 설명. */
export function getKoreanArchiveSubtitle(
  classify: ArchiveClassification,
  label: string,
  count: number,
): string {
  const name = getKoreanArchiveLabel(classify, label)
  if (count === 0) {
    return "아직 이 목록에 글이 없습니다."
  }
  if (classify === "category") {
    return `${name} 카테고리의 글 ${count}편`
  }
  if (classify === "tag") {
    return `${name} 태그가 달린 글 ${count}편`
  }
  return `${name}년에 쓴 글 ${count}편`
}

/** 검색 결과 스니펫으로 쓰이는 meta description. 화면에는 노출되지 않는다. */
export function getKoreanArchiveDescription(
  classify: ArchiveClassification,
  label: string,
  count: number,
): string {
  const name = getKoreanArchiveLabel(classify, label)
  if (classify === "category") {
    return `${name} 카테고리에 속한 글 ${count}편을 모았습니다. 고진무의 블로그에서 ${name} 주제로 쓴 기록을 한눈에 볼 수 있습니다.`
  }
  if (classify === "tag") {
    return `${name} 태그가 달린 글 ${count}편을 모았습니다. 고진무의 블로그에서 ${name} 관련 기록을 한눈에 볼 수 있습니다.`
  }
  return `${name}년에 쓴 글 ${count}편을 모았습니다. 그해 고진무가 남긴 개발·러닝·독서 기록을 시간순으로 볼 수 있습니다.`
}
