import type { MemoMetadata, PostMetadata } from "@/types/content"
import { Flower } from "./LikeFlower"

interface UserSectionHeaderProps {
  readonly slug: string
  readonly maxLikesPerIP?: number
  readonly frontmatter?: PostMetadata | MemoMetadata
}

export const UserSectionHeader: React.FC<UserSectionHeaderProps> = ({
  slug,
  maxLikesPerIP = 5,
  frontmatter,
}) => {
  return (
    <div className="flex flex-col gap-2 items-center justify-center">
      <Flower slug={slug} maxLikesPerIP={maxLikesPerIP} frontmatter={frontmatter} />
    </div>
  )
}
