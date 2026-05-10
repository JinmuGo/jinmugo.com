import { describe, expect, it } from "vitest"
import {
  buildGalleryCaption,
  buildGalleryImageFromManifestItem,
  encodeCdnKey,
  isRenderableGalleryKey,
} from "./gallery"

describe("gallery utils", () => {
  describe("encodeCdnKey", () => {
    it("encodes each path segment without escaping slashes", () => {
      expect(encodeCdnKey("jinmu.me/서울 사진/IMG 001.jpeg")).toBe(
        "jinmu.me/%EC%84%9C%EC%9A%B8%20%EC%82%AC%EC%A7%84/IMG%20001.jpeg",
      )
    })
  })

  describe("isRenderableGalleryKey", () => {
    it("keeps web image files and skips sidecars, videos, and originals not rendered by the gallery", () => {
      expect(isRenderableGalleryKey("jinmu.me/photo.jpeg")).toBe(true)
      expect(isRenderableGalleryKey("jinmu.me/photo.webp")).toBe(true)
      expect(isRenderableGalleryKey("jinmu.me/photo.mov")).toBe(false)
      expect(isRenderableGalleryKey("jinmu.me/photo.heic")).toBe(false)
      expect(isRenderableGalleryKey("jinmu.me/gallery-manifest.json")).toBe(false)
      expect(isRenderableGalleryKey("jinmu.me/photo.xmp")).toBe(false)
    })
  })

  describe("buildGalleryImageFromManifestItem", () => {
    it("normalizes manifest metadata into a renderable gallery image", () => {
      expect(
        buildGalleryImageFromManifestItem(
          {
            key: "jinmu.me/2026/05/IMG 0001.jpeg",
            width: 3024,
            height: 4032,
            takenAt: "2026-05-08T13:24:00+09:00",
            locationLabel: "Seoul, South Korea",
          },
          "https://cdn.jinmu.me",
        ),
      ).toEqual({
        key: "jinmu.me/2026/05/IMG 0001.jpeg",
        src: "https://cdn.jinmu.me/jinmu.me/2026/05/IMG%200001.jpeg",
        width: 3024,
        height: 4032,
        takenAt: "2026-05-08T13:24:00+09:00",
        locationLabel: "Seoul, South Korea",
      })
    })

    it("falls back to default dimensions and omits blank optional metadata", () => {
      expect(
        buildGalleryImageFromManifestItem(
          {
            key: "jinmu.me/photo.jpeg",
            width: 0,
            height: Number.NaN,
            takenAt: "",
            locationLabel: "   ",
          },
          "https://cdn.jinmu.me/",
        ),
      ).toEqual({
        key: "jinmu.me/photo.jpeg",
        src: "https://cdn.jinmu.me/jinmu.me/photo.jpeg",
        width: 1200,
        height: 800,
      })
    })
  })

  describe("buildGalleryCaption", () => {
    it("formats Korean metadata with date, time, and coarse location", () => {
      expect(
        buildGalleryCaption({
          takenAt: "2026-05-08T13:24:00+09:00",
          locationLabel: "Seoul, South Korea",
          locale: "ko",
          timeZone: "Asia/Seoul",
        }),
      ).toBe("2026년 5월 8일 13:24 · Seoul, South Korea")
    })

    it("formats English metadata with date, time, and coarse location", () => {
      expect(
        buildGalleryCaption({
          takenAt: "2026-05-08T13:24:00+09:00",
          locationLabel: "Seoul, South Korea",
          locale: "en",
          timeZone: "Asia/Seoul",
        }),
      ).toBe("May 8, 2026, 1:24 PM · Seoul, South Korea")
    })

    it("uses only available metadata and returns undefined when nothing is displayable", () => {
      expect(buildGalleryCaption({ locationLabel: "Busan, South Korea", locale: "ko" })).toBe(
        "Busan, South Korea",
      )
      expect(buildGalleryCaption({ takenAt: "", locationLabel: "", locale: "en" })).toBeUndefined()
    })
  })
})
