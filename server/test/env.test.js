import assert from "node:assert/strict"
import test from "node:test"
import {
  commaSeparatedEnv,
  minimumLengthEnv,
  requiredEnv,
  secureSecretEnv,
  serverPort,
} from "../dist/env.js"

test("required server configuration fails fast and parses safe values", () => {
  assert.throws(() => requiredEnv("DATABASE_URL", {}), /DATABASE_URL/)
  assert.throws(
    () => requiredEnv("BETTER_AUTH_SECRET", { BETTER_AUTH_SECRET: "  " }),
    /BETTER_AUTH_SECRET/,
  )
  assert.throws(
    () => minimumLengthEnv("BETTER_AUTH_SECRET", 32, { BETTER_AUTH_SECRET: "x".repeat(31) }),
    /at least 32 characters/,
  )
  assert.equal(
    minimumLengthEnv("BETTER_AUTH_SECRET", 32, { BETTER_AUTH_SECRET: "x".repeat(32) }),
    "x".repeat(32),
  )
  assert.throws(
    () => secureSecretEnv("BETTER_AUTH_SECRET", { BETTER_AUTH_SECRET: "x".repeat(32) }),
    /120 bits/,
  )
  const secureSecret = "0123456789abcdef".repeat(2)
  assert.equal(
    secureSecretEnv("BETTER_AUTH_SECRET", { BETTER_AUTH_SECRET: secureSecret }),
    secureSecret,
  )
  assert.deepEqual(
    commaSeparatedEnv("FRONTEND_URL", {
      FRONTEND_URL: "https://jinmu.me, http://localhost:4322",
    }),
    ["https://jinmu.me", "http://localhost:4322"],
  )
  assert.throws(() => commaSeparatedEnv("FRONTEND_URL", { FRONTEND_URL: " , " }), /FRONTEND_URL/)
  assert.equal(serverPort({}), 3001)
  assert.throws(() => serverPort({ PORT: "nope" }), /Invalid PORT/)
})
