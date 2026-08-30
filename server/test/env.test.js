import assert from "node:assert/strict"
import test from "node:test"
import { commaSeparatedEnv, requiredEnv, serverPort } from "../dist/env.js"

test("required server configuration fails fast and parses safe values", () => {
  assert.throws(() => requiredEnv("DATABASE_URL", {}), /DATABASE_URL/)
  assert.throws(
    () => requiredEnv("BETTER_AUTH_SECRET", { BETTER_AUTH_SECRET: "  " }),
    /BETTER_AUTH_SECRET/,
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
