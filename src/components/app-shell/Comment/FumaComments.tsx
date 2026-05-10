import { Comments } from "@fuma-comment/react"
import { createAuthClient } from "better-auth/react"

const COMMENT_API_URL = import.meta.env.PUBLIC_COMMENT_API_URL ?? "http://localhost:3001"

// fuma-comment's internal fetcher does not pass `credentials: "include"`,
// so the BetterAuth session cookie is not sent on cross-origin requests
// to the comment server. Patch global fetch once to inject credentials
// for any request whose URL targets the comment API.
if (typeof window !== "undefined" && !("__fumaFetchPatched" in window)) {
  const originalFetch = window.fetch.bind(window)
  window.fetch = (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url
    if (url.startsWith(COMMENT_API_URL)) {
      return originalFetch(input, { ...init, credentials: "include" })
    }
    return originalFetch(input, init)
  }
  ;(window as unknown as { __fumaFetchPatched: boolean }).__fumaFetchPatched = true
}

const authClient = createAuthClient({
  baseURL: COMMENT_API_URL,
})

interface FumaCommentsProps {
  slug: string
}

export function FumaComments({ slug }: FumaCommentsProps) {
  return (
    <Comments
      page={slug}
      apiUrl={`${COMMENT_API_URL}/api/comments`}
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
