"use client";

// import { signIn } from "next-auth/react";
import type { CommentsProps } from "@fuma-comment/react";
import { Comments } from "@fuma-comment/react";
import { createUploadThingStorage } from "@fuma-comment/react/uploadthing";

const storage = createUploadThingStorage();

export interface CommentsWithAuthProps extends Omit<CommentsProps, "auth"> {
  /** called *after* the user’s comment has been saved to your `/api/comments/[page]` */
  setCommentVerison: React.Dispatch<React.SetStateAction<number>>;
}

export function CommentsWithAuth({ setCommentVerison, ...props }: CommentsWithAuthProps) {
  return (
    <Comments
      onSubmit={() => {
        setCommentVerison((v) => v + 1);
      }}
      storage={storage}
      mention={{
        enabled: true,
      }}
      auth={{
        type: "api",
        signIn: () => void signIn("github"),
      }}
      {...props}
    />
  );
}
