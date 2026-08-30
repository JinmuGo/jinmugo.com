// @vitest-environment jsdom

import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { ObsidianDownloadCount } from "./ObsidianDownloadCount"

describe("ObsidianDownloadCount", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("shares one stats request across plugin counts", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        "plugin-one": { downloads: 101 },
        "plugin-two": { downloads: 202 },
      }),
    })
    vi.stubGlobal("fetch", fetchMock)

    render(
      <>
        <ObsidianDownloadCount pluginId="plugin-one" />
        <ObsidianDownloadCount pluginId="plugin-two" />
      </>,
    )

    expect(await screen.findByText("(101 downloads)")).toBeInTheDocument()
    expect(await screen.findByText("(202 downloads)")).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock).toHaveBeenCalledWith(
      "https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugin-stats.json",
      { cache: "no-store" },
    )
  })
})
