import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "./db/index.js"
import * as schema from "./db/schema.js"

const trustedOrigins = (process.env.FRONTEND_URL ?? "http://localhost:4322")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean)

export const auth = betterAuth({
  // Explicit baseURL so OAuth callback URLs always use https. Coolify
  // terminates TLS at the proxy, so requests reach the container as plain
  // http and BetterAuth would otherwise infer the wrong scheme.
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  trustedOrigins,
  secret: process.env.BETTER_AUTH_SECRET,
  advanced: {
    // Cross-origin cookie attributes so browsers accept the session cookie
    // when the frontend runs on a different origin (e.g. localhost during
    // local testing against the production comment server).
    //
    // NOTE: do NOT enable `partitioned` here. Partitioned cookies (CHIPS)
    // are scoped per top-level site, so the OAuth state cookie set during
    // a cross-origin sign-in fetch (top=localhost) becomes invisible when
    // the OAuth provider redirects directly to the callback URL
    // (top=comment.jinmu.me), causing a state_mismatch on every login.
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },
})
