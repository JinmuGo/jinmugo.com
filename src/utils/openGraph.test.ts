import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("satori", () => ({
  default: vi.fn().mockResolvedValue("<svg />"),
}))

function fontResponse(byte: number) {
  return {
    ok: true,
    status: 200,
    arrayBuffer: vi.fn().mockResolvedValue(Uint8Array.of(byte).buffer),
  }
}

describe("Open Graph fonts", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("shares font requests and retries after a rejected load", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("CDN unavailable"))
      .mockResolvedValueOnce(fontResponse(1))
      .mockResolvedValueOnce(fontResponse(2))
      .mockResolvedValueOnce(fontResponse(3))
    vi.stubGlobal("fetch", fetchMock)

    const { SVG } = await import("./openGraph")
    const component = {} as Parameters<typeof SVG>[0]

    await expect(SVG(component)).rejects.toThrow("CDN unavailable")
    await Promise.all([SVG(component), SVG(component)])

    expect(fetchMock).toHaveBeenCalledTimes(4)
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "https://cdn.jsdelivr.net/gh/fonts-archive/AstaSans/AstaSans-Regular.otf",
      "https://cdn.jsdelivr.net/gh/fonts-archive/AstaSans/AstaSans-Bold.otf",
      "https://cdn.jsdelivr.net/gh/fonts-archive/AstaSans/AstaSans-Regular.otf",
      "https://cdn.jsdelivr.net/gh/fonts-archive/AstaSans/AstaSans-Bold.otf",
    ])
  })
})
