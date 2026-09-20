import fs from "node:fs/promises"
import path from "node:path"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import exifr from "exifr"
import sharp from "sharp"

const DEFAULT_PREFIX = "jinmu.me/"
const DEFAULT_OUT = "gallery-manifest.json"
const DEFAULT_CACHE_PATH = ".cache/gallery-geocode.json"
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"])

const args = parseArgs(process.argv.slice(2))

if (!args.directory) {
  console.error(
    "Usage: node scripts/build-gallery-manifest.js <icloudpd-directory> [--prefix jinmu.me/] [--out gallery-manifest.json] [--upload] [--geocode-cache .cache/gallery-geocode.json]",
  )
  process.exit(1)
}

const geocodeCache = await readJsonFile(args.geocodeCache, {})
const files = await listImageFiles(args.directory)
const items = []

for (const filePath of files) {
  const item = await buildManifestItem({
    filePath,
    rootDirectory: args.directory,
    prefix: args.prefix,
    geocodeCache,
  })
  items.push(item)
}

items.sort((a, b) => {
  const dateA = a.takenAt ? Date.parse(a.takenAt) : 0
  const dateB = b.takenAt ? Date.parse(b.takenAt) : 0
  return dateB - dateA || a.key.localeCompare(b.key)
})

const manifest = {
  version: 1,
  generatedAt: new Date().toISOString(),
  items,
}

await fs.mkdir(path.dirname(args.out), { recursive: true })
await fs.writeFile(args.out, `${JSON.stringify(manifest, null, 2)}\n`)
await fs.mkdir(path.dirname(args.geocodeCache), { recursive: true })
await fs.writeFile(args.geocodeCache, `${JSON.stringify(geocodeCache, null, 2)}\n`)

if (args.upload) {
  await uploadManifest(args.out, args.prefix)
}

console.log(`Generated ${args.out} with ${items.length} gallery items`)

function parseArgs(argv) {
  const parsed = {
    directory: undefined,
    prefix: DEFAULT_PREFIX,
    out: DEFAULT_OUT,
    upload: false,
    geocodeCache: DEFAULT_CACHE_PATH,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === "--prefix") {
      parsed.prefix = argv[index + 1] ?? DEFAULT_PREFIX
      index += 1
      continue
    }
    if (arg === "--out") {
      parsed.out = argv[index + 1] ?? DEFAULT_OUT
      index += 1
      continue
    }
    if (arg === "--geocode-cache") {
      parsed.geocodeCache = argv[index + 1] ?? DEFAULT_CACHE_PATH
      index += 1
      continue
    }
    if (arg === "--upload") {
      parsed.upload = true
      continue
    }
    if (!parsed.directory) {
      parsed.directory = arg
    }
  }

  return parsed
}

async function buildManifestItem({ filePath, rootDirectory, prefix, geocodeCache }) {
  const [imageMetadata, exifMetadata] = await Promise.all([
    readImageMetadata(filePath),
    readExif(filePath),
  ])
  const relativePath = path.relative(rootDirectory, filePath)
  const { latitude, longitude } = extractGps(exifMetadata)

  return stripUndefined({
    key: buildGalleryManifestKey(relativePath, prefix),
    width: imageMetadata.width,
    height: imageMetadata.height,
    takenAt: extractTakenAt(exifMetadata),
    locationLabel:
      latitude !== undefined && longitude !== undefined
        ? await reverseGeocodeCoarse(latitude, longitude, geocodeCache)
        : undefined,
  })
}

async function readImageMetadata(filePath) {
  const metadata = await sharp(filePath).metadata()
  const width = metadata.width ?? 1200
  const height = metadata.height ?? 800

  if (metadata.orientation && metadata.orientation >= 5) {
    return { width: height, height: width }
  }

  return { width, height }
}

async function readExif(filePath) {
  try {
    return (
      (await exifr.parse(filePath, {
        gps: true,
        ifd0: true,
        exif: true,
        xmp: true,
      })) ?? {}
    )
  } catch (error) {
    console.warn(`Failed to parse EXIF for ${filePath}:`, error)
    return {}
  }
}

function extractTakenAt(metadata) {
  return normalizeExifDate(
    metadata.DateTimeOriginal ??
      metadata.CreateDate ??
      metadata.DateCreated ??
      metadata.ModifyDate ??
      metadata.created ??
      metadata.dateCreated,
  )
}

function extractGps(metadata) {
  const latitude = toNumber(metadata.latitude ?? metadata.GPSLatitude)
  const longitude = toNumber(metadata.longitude ?? metadata.GPSLongitude)

  return {
    latitude,
    longitude,
  }
}

async function reverseGeocodeCoarse(latitude, longitude, geocodeCache) {
  const cacheKey = `${roundCoordinateForCache(latitude)},${roundCoordinateForCache(longitude)}`
  if (typeof geocodeCache[cacheKey] === "string") {
    return geocodeCache[cacheKey]
  }

  const url = new URL("https://nominatim.openstreetmap.org/reverse")
  url.searchParams.set("format", "jsonv2")
  url.searchParams.set("lat", String(latitude))
  url.searchParams.set("lon", String(longitude))
  url.searchParams.set("zoom", "10")
  url.searchParams.set("addressdetails", "1")
  url.searchParams.set("accept-language", "en")

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          process.env.GALLERY_GEOCODER_USER_AGENT ??
          "jinmugo.com gallery metadata (hi@jinmugo.com)",
      },
    })
    if (!response.ok) {
      console.warn(`Reverse geocode failed for ${cacheKey}: ${response.status}`)
      return undefined
    }

    const data = await response.json()
    const label = buildCoarseLocationLabel(data.address)
    if (label) {
      geocodeCache[cacheKey] = label
    }
    return label
  } catch (error) {
    console.warn(`Reverse geocode failed for ${cacheKey}:`, error)
    return undefined
  }
}

async function uploadManifest(outPath, prefix) {
  const bucketName = process.env.R2_BUCKET_NAME
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  const accountId = process.env.R2_ACCOUNT_ID

  if (!bucketName || !accessKeyId || !secretAccessKey || !accountId) {
    throw new Error(
      "R2_BUCKET_NAME, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_ACCOUNT_ID are required",
    )
  }

  const s3Client = new S3Client({
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    region: "auto",
  })

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: `${prefix.replace(/\/+$/, "")}/gallery-manifest.json`,
      Body: await fs.readFile(outPath),
      ContentType: "application/json; charset=utf-8",
      CacheControl: "public, max-age=300",
    }),
  )
}

async function listImageFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await listImageFiles(entryPath)))
      continue
    }

    if (entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(entryPath)
    }
  }

  return files
}

async function readJsonFile(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"))
  } catch {
    return fallback
  }
}

function normalizeExifDate(value) {
  if (!value) {
    return undefined
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString()
  }

  const trimmed = String(value).trim()
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

function buildGalleryManifestKey(relativePath, prefix) {
  const normalizedPrefix = prefix.replace(/\/+$/, "")
  const normalizedPath = relativePath.replaceAll("\\", "/").replace(/^\/+/, "")
  return `${normalizedPrefix}/${normalizedPath}`
}

function buildCoarseLocationLabel(address) {
  if (!address || typeof address !== "object") {
    return undefined
  }

  const locality =
    address.city ??
    address.town ??
    address.village ??
    address.municipality ??
    address.county ??
    address.state
  const parts = [locality, address.country].filter(
    (part) => typeof part === "string" && part.trim(),
  )
  const uniqueParts = [...new Set(parts.map((part) => part.trim()))]

  return uniqueParts.length > 0 ? uniqueParts.join(", ") : undefined
}

function roundCoordinateForCache(coordinate, precision = 2) {
  return coordinate.toFixed(precision)
}

function toNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  return undefined
}

function stripUndefined(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
  )
}
