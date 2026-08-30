/**
 * @param {string} value
 */
export function normalizeArchiveSegment(value) {
  const segment = value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")

  if (!segment) {
    throw new Error(`Archive segment is empty after normalization: ${JSON.stringify(value)}`)
  }

  return segment
}
