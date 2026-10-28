// 내용을 대조한 중복 그룹이다. 파일명 패턴만으로 다른 사진을 제외하지 않는다.
// 각 그룹은 먼저 표시할 파일 순서이며 원본 파일은 삭제하지 않는다.
const verifiedDuplicateGroups: readonly (readonly string[])[] = [
  ["jinmu.me/IMG_3326.JPG", "jinmu.me/IMG_3326-1694229.JPG", "jinmu.me/IMG_3326.jpg"],
  ["jinmu.me/IMG_3329.JPG", "jinmu.me/IMG_3329-1842483.JPG", "jinmu.me/IMG_3329.jpg"],
  ["jinmu.me/IMG_3958.JPG", "jinmu.me/IMG_3958-772075.JPG", "jinmu.me/IMG_3958.jpg"],
  ["jinmu.me/IMG_4224.JPG", "jinmu.me/IMG_4224-1013118.JPG", "jinmu.me/IMG_4224.jpg"],
  ["jinmu.me/IMG_5296.JPG", "jinmu.me/IMG_5296-3430598.JPG", "jinmu.me/IMG_5296.jpg"],
  ["jinmu.me/IMG_5343.JPG", "jinmu.me/IMG_5343-2602733.JPG", "jinmu.me/IMG_5343.jpg"],
  ["jinmu.me/IMG_5344.JPG", "jinmu.me/IMG_5344-841142.JPG", "jinmu.me/IMG_5344.jpg"],
  ["jinmu.me/IMG_5349.JPG", "jinmu.me/IMG_5349-907991.JPG", "jinmu.me/IMG_5349.jpg"],
  ["jinmu.me/IMG_5377.JPG", "jinmu.me/IMG_5377-4492267.JPG", "jinmu.me/IMG_5377.jpg"],
  ["jinmu.me/IMG_5378.JPG", "jinmu.me/IMG_5378-4682855.JPG", "jinmu.me/IMG_5378.jpg"],
  ["jinmu.me/IMG_5506.JPG", "jinmu.me/IMG_5506-535990.JPG", "jinmu.me/IMG_5506.jpg"],
  ["jinmu.me/IMG_5693.JPG", "jinmu.me/IMG_5693-2880351.JPG", "jinmu.me/IMG_5693.jpg"],
  ["jinmu.me/IMG_5759.JPG", "jinmu.me/IMG_5759-954917.JPG", "jinmu.me/IMG_5759.jpg"],
  ["jinmu.me/IMG_5822.JPG", "jinmu.me/IMG_5822-1213345.JPG", "jinmu.me/IMG_5822.jpg"],
  ["jinmu.me/IMG_6198.JPG", "jinmu.me/IMG_6198-2151010.JPG", "jinmu.me/IMG_6198.jpg"],
  ["jinmu.me/IMG_6548.JPG", "jinmu.me/IMG_6548-1695622.JPG", "jinmu.me/IMG_6548.jpg"],
  ["jinmu.me/lp_image.JPG", "jinmu.me/lp_image-373706.JPG", "jinmu.me/lp_image.jpg"],
]

export const excludeGalleryDuplicates = <T extends { key: string }>(images: T[]): T[] => {
  const availableKeys = new Set(images.map((image) => image.key))
  const excludedKeys = new Set<string>()

  for (const group of verifiedDuplicateGroups) {
    const preferredKey = group.find((key) => availableKeys.has(key))
    for (const key of group) {
      if (key !== preferredKey) {
        excludedKeys.add(key)
      }
    }
  }

  const seenKeys = new Set<string>()
  return images.filter((image) => {
    if (excludedKeys.has(image.key) || seenKeys.has(image.key)) {
      return false
    }
    seenKeys.add(image.key)
    return true
  })
}
