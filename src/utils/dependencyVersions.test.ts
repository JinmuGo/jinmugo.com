import { readFileSync } from "node:fs"
import { expect, it } from "vitest"

it("keeps the Tiptap editor packages on one compatible release", () => {
  const lockfile = readFileSync(new URL("../../pnpm-lock.yaml", import.meta.url), "utf8")
  const versions = [...lockfile.matchAll(/^ {2}'@tiptap\/[^@']+@(\d+\.\d+\.\d+)':/gm)].map(
    (match) => match[1],
  )
  expect(versions.length).toBeGreaterThan(1)
  expect([...new Set(versions)]).toHaveLength(1)
})
