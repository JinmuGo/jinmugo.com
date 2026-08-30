import { commaSeparatedEnv, minimumLengthEnv, requiredEnv, serverPort } from "./env.js"

export const config = {
  databaseUrl: requiredEnv("DATABASE_URL"),
  betterAuthSecret: minimumLengthEnv("BETTER_AUTH_SECRET", 32),
  betterAuthUrl: requiredEnv("BETTER_AUTH_URL"),
  githubClientId: requiredEnv("GITHUB_CLIENT_ID"),
  githubClientSecret: requiredEnv("GITHUB_CLIENT_SECRET"),
  frontendOrigins: commaSeparatedEnv("FRONTEND_URL"),
  port: serverPort(),
}
