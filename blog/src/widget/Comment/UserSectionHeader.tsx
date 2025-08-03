import { useLike } from "@/lib/supabase-utils"
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
  const { totalLikes, isLoading, error } = useLike(slug)

  return (
    <div className="flex flex-col gap-2 items-center justify-center">
      <Flower slug={slug} maxLikesPerIP={maxLikesPerIP} frontmatter={frontmatter} />
      <div className="flex flex-col">
        <p className="select-none text-sm font-regular">
          {isLoading || totalLikes === -1 ? "..." : totalLikes}
        </p>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    </div>
  )
}
