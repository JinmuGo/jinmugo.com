import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "./db/index.js"
import * as schema from "./db/schema.js"

const trustedOrigins = (process.env.FRONTEND_URL ?? "http://localhost:4321")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean)

export const auth = betterAuth({
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
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      partitioned: true,
    },
  },
})
