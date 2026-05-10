import { describe, expect, it } from "vitest"
import {
  buildCoarseLocationLabel,
  buildGalleryManifestKey,
  normalizeExifDate,
  roundCoordinateForCache,
} from "./galleryManifest"

describe("gallery manifest utils", () => {
  describe("normalizeExifDate", () => {
    it("converts EXIF date strings to ISO-like local timestamps", () => {
      expect(normalizeExifDate("2026:05:08 13:24:00")).toBe("2026-05-08T13:24:00")
    })

    it("keeps valid ISO date strings and Date values as ISO strings", () => {
      expect(normalizeExifDate("2026-05-08T13:24:00+09:00")).toBe("2026-05-08T13:24:00+09:00")
      expect(normalizeExifDate(new Date("2026-05-08T04:24:00.000Z"))).toBe(
        "2026-05-08T04:24:00.000Z",
      )
    })

    it("returns undefined for empty or invalid values", () => {
      expect(normalizeExifDate()).toBeUndefined()
      expect(normalizeExifDate("")).toBeUndefined()
      expect(normalizeExifDate("not a date")).toBeUndefined()
    })
  })

  describe("buildGalleryManifestKey", () => {
    it("maps local paths to the configured R2 prefix using POSIX separators", () => {
      expect(buildGalleryManifestKey("2026/05/IMG 0001.jpeg", "jinmu.me/")).toBe(
        "jinmu.me/2026/05/IMG 0001.jpeg",
      )
    })

    it("does not duplicate slashes when prefix is missing a trailing slash", () => {
      expect(buildGalleryManifestKey("photo.jpeg", "jinmu.me")).toBe("jinmu.me/photo.jpeg")
    })
  })

  describe("buildCoarseLocationLabel", () => {
    it("prefers city-level address fields and appends the country", () => {
      expect(
        buildCoarseLocationLabel({
          city: "Seoul",
          state: "Seoul",
          country: "South Korea",
        }),
      ).toBe("Seoul, South Korea")
    })

    it("falls back to state or country when city-level fields are unavailable", () => {
      expect(buildCoarseLocationLabel({ state: "Jeju-do", country: "South Korea" })).toBe(
        "Jeju-do, South Korea",
      )
      expect(buildCoarseLocationLabel({ country: "Japan" })).toBe("Japan")
    })
  })

  describe("roundCoordinateForCache", () => {
    it("rounds coordinates to reduce cache precision", () => {
      expect(roundCoordinateForCache(37.566535, 2)).toBe("37.57")
      expect(roundCoordinateForCache(126.978, 2)).toBe("126.98")
    })
  })
})
