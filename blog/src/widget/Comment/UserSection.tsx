import type { MemoMetadata, PostMetadata } from "@/types/content"
import { GiscusComments } from "./GiscusComments"
import { UserSectionHeader } from "./UserSectionHeader"

interface UserSectionProps {
  readonly slug: string
  readonly frontmatter?: PostMetadata | MemoMetadata
}

export const UserSection: React.FC<UserSectionProps> = ({ slug, frontmatter }) => {
  return (
    <section className="flex flex-col gap-2 mt-28 mb-6 text md:text-lg">
      <UserSectionHeader slug={slug} maxLikesPerIP={5} frontmatter={frontmatter} />
      <GiscusComments />
    </section>
  )
}
