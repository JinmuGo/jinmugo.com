import { commaSeparatedEnv, requiredEnv, secureSecretEnv, serverPort } from "./env.js"

export const config = {
  databaseUrl: requiredEnv("DATABASE_URL"),
  betterAuthSecret: secureSecretEnv("BETTER_AUTH_SECRET"),
  betterAuthUrl: requiredEnv("BETTER_AUTH_URL"),
  githubClientId: requiredEnv("GITHUB_CLIENT_ID"),
  githubClientSecret: requiredEnv("GITHUB_CLIENT_SECRET"),
  frontendOrigins: commaSeparatedEnv("FRONTEND_URL"),
  port: serverPort(),
}
