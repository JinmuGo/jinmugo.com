import { createBetterAuthAdapter } from "@fuma-comment/server/adapters/better-auth"
import { createDrizzleAdapter } from "@fuma-comment/server/adapters/drizzle"
import { auth } from "./auth.js"
import { db } from "./db/index.js"
import { comments, rates, roles, user } from "./db/schema.js"

export const storage = createDrizzleAdapter({
  db,
  auth: "better-auth",
  schemas: {
    comments,
    rates,
    roles,
    user,
  },
})

export const commentAuth = createBetterAuthAdapter(auth)
