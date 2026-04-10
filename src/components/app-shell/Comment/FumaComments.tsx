import { Comments } from "@fuma-comment/react"
import { createAuthClient } from "better-auth/react"

const authClient = createAuthClient({
  baseURL: import.meta.env.PUBLIC_COMMENT_API_URL ?? "http://localhost:3001",
})

interface FumaCommentsProps {
  slug: string
}

export function FumaComments({ slug }: FumaCommentsProps) {
  return (
    <Comments
      page={slug}
      apiUrl={`${import.meta.env.PUBLIC_COMMENT_API_URL ?? "http://localhost:3001"}/api/comments`}
      auth={{
        type: "api",
        signIn: () => {
          // callbackURL: come back to the same page after OAuth instead of
          // landing on the comment server's baseURL.
          authClient.signIn.social({
            provider: "github",
            callbackURL: window.location.href,
          })
        },
      }}
    />
  )
}
