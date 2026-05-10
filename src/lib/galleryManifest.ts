export interface ReverseGeocodeAddress {
  city?: string
  town?: string
  village?: string
  municipality?: string
  county?: string
  state?: string
  country?: string
}

export const normalizeExifDate = (value?: Date | string): string | undefined => {
  if (!value) {
    return undefined
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString()
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }

  const exifDateMatch = trimmed.match(/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(.*)$/)
  if (exifDateMatch) {
    const [, year, month, day, hour, minute, second, suffix] = exifDateMatch
    return `${year}-${month}-${day}T${hour}:${minute}:${second}${suffix ?? ""}`
  }

  const parsed = new Date(trimmed)
  return Number.isNaN(parsed.getTime()) ? undefined : trimmed
}

export const buildGalleryManifestKey = (relativePath: string, prefix: string): string => {
  const normalizedPrefix = prefix.replace(/\/+$/, "")
  const normalizedPath = relativePath.replaceAll("\\", "/").replace(/^\/+/, "")
  return `${normalizedPrefix}/${normalizedPath}`
}

export const buildCoarseLocationLabel = (
  address: ReverseGeocodeAddress | undefined,
): string | undefined => {
  if (!address) {
    return undefined
  }

  const locality =
    address.city ??
    address.town ??
    address.village ??
    address.municipality ??
    address.county ??
    address.state
  const parts = [locality, address.country].filter((part): part is string => Boolean(part?.trim()))
  const uniqueParts = [...new Set(parts.map((part) => part.trim()))]

  return uniqueParts.length > 0 ? uniqueParts.join(", ") : undefined
}

export const roundCoordinateForCache = (coordinate: number, precision = 2): string =>
  coordinate.toFixed(precision)
