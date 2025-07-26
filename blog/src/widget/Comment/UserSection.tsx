import { useState } from "react";
import { UserSectionHeader } from "./UserSectionHeader";
import { CommentsWithAuth } from "./CommentsWithAuth";

interface UserSectionProps {
  readonly slug: string;
}

export const UserSection: React.FC<UserSectionProps> = ({ slug }) => {
  const [commentVersion, setCommentVersion] = useState<number>(0);

  return (
    <section className="flex flex-col gap-4 my-4 text md:text-lg">
      <UserSectionHeader slug={slug} commentVersion={commentVersion} />
      <CommentsWithAuth id="comment" page={slug} setCommentVerison={setCommentVersion} />
    </section>
  );
};
