import {
  type _Object,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3"
import { excludeGalleryDuplicates } from "./galleryDuplicates"

const DEFAULT_GALLERY_PREFIX = "jinmu.me/"
const MANIFEST_FILENAME = "gallery-manifest.json"
const DEFAULT_WIDTH = 1200
const DEFAULT_HEIGHT = 800

export interface GalleryManifestItem {
  key: string
  width?: number
  height?: number
  takenAt?: string
  locationLabel?: string
}

export interface GalleryManifest {
  version: number
  generatedAt?: string
  items: GalleryManifestItem[]
}

export interface GalleryImage {
  key: string
  src: string
  width: number
  height: number
  takenAt?: string
  locationLabel?: string
}

export interface GalleryR2Config {
  bucketName: string
  accessKeyId: string
  secretAccessKey: string
  accountId: string
  cdnUrl: string
  prefix?: string
  logPrefix?: string
}

export interface GalleryCaptionInput {
  takenAt?: string
  locationLabel?: string
  locale: "ko" | "en"
  timeZone?: string
}

type ErrorWithMetadata = {
  $metadata?: { httpStatusCode?: number }
  name?: string
  $response?: { body?: unknown }
}

export const encodeCdnKey = (key: string): string =>
  key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/")

export const isRenderableGalleryKey = (key: string): boolean => {
  const lowerKey = key.toLowerCase()
  return (
    [".jpg", ".jpeg", ".png", ".webp", ".gif"].some((ext) => lowerKey.endsWith(ext)) &&
    !lowerKey.endsWith(".heic") &&
    !lowerKey.endsWith(".mov")
  )
}

export const buildGalleryImageFromManifestItem = (
  item: GalleryManifestItem,
  cdnUrl: string,
): GalleryImage => {
  const width =
    Number.isFinite(item.width) && item.width && item.width > 0 ? item.width : DEFAULT_WIDTH
  const height =
    Number.isFinite(item.height) && item.height && item.height > 0 ? item.height : DEFAULT_HEIGHT
  const image: GalleryImage = {
    key: item.key,
    src: `${cdnUrl.replace(/\/+$/, "")}/${encodeCdnKey(item.key)}`,
    width,
    height,
  }

  if (item.takenAt?.trim()) {
    image.takenAt = item.takenAt.trim()
  }

  if (item.locationLabel?.trim()) {
    image.locationLabel = item.locationLabel.trim()
  }

  return image
}

export const buildGalleryCaption = ({
  takenAt,
  locationLabel,
  locale,
  timeZone = "Asia/Seoul",
}: GalleryCaptionInput): string | undefined => {
  const parts = [formatTakenAt(takenAt, locale, timeZone), locationLabel?.trim()].filter(
    (part): part is string => Boolean(part),
  )

  return parts.length > 0 ? parts.join(" · ") : undefined
}

export const getGalleryImagesFromR2 = async ({
  bucketName,
  accessKeyId,
  secretAccessKey,
  accountId,
  cdnUrl,
  prefix = DEFAULT_GALLERY_PREFIX,
  logPrefix = "[gallery]",
}: GalleryR2Config): Promise<GalleryImage[]> => {
  const s3Client = new S3Client({
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    region: "auto",
  })

  const manifest = await loadGalleryManifest(
    s3Client,
    bucketName,
    `${prefix}${MANIFEST_FILENAME}`,
    logPrefix,
  )

  const images = manifest
    ? manifest.items
        .filter((item) => item.key && isRenderableGalleryKey(item.key))
        .map((item) => buildGalleryImageFromManifestItem(item, cdnUrl))
    : await listGalleryImagesFromR2({ s3Client, bucketName, cdnUrl, prefix, logPrefix })

  const uniqueImages = excludeGalleryDuplicates(images)
  console.info(
    `${logPrefix} displaying ${uniqueImages.length}/${images.length} images after duplicate filtering`,
  )
  return uniqueImages
}

const formatTakenAt = (
  takenAt: string | undefined,
  locale: GalleryCaptionInput["locale"],
  timeZone: string,
): string | undefined => {
  if (!takenAt?.trim()) {
    return undefined
  }

  const date = new Date(takenAt)
  if (Number.isNaN(date.getTime())) {
    return undefined
  }

  if (locale === "ko") {
    const formatter = new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone,
    })
    const parts = Object.fromEntries(
      formatter.formatToParts(date).map((part) => [part.type, part.value]),
    )
    return `${parts.year}년 ${parts.month}월 ${parts.day}일 ${parts.hour}:${parts.minute}`
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  })

  return formatter.format(date).replace(" at ", ", ")
}

const listGalleryImagesFromR2 = async ({
  s3Client,
  bucketName,
  cdnUrl,
  prefix,
  logPrefix,
}: {
  s3Client: S3Client
  bucketName: string
  cdnUrl: string
  prefix: string
  logPrefix: string
}): Promise<GalleryImage[]> => {
  let listContents: _Object[] = []
  let listKeyCount = 0
  try {
    const { Contents, KeyCount } = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        EncodingType: "url",
      }),
    )
    listContents = (Contents ?? []) as _Object[]
    listKeyCount = KeyCount ?? 0
  } catch (listError) {
    const fallbackKeys = await extractListKeysFromError(listError)
    if (fallbackKeys.length === 0) {
      throw listError
    }

    console.warn(
      `${logPrefix} SDK XML parser failed, recovered ${fallbackKeys.length} keys from raw XML body`,
    )
    listContents = fallbackKeys.map((key) => ({ Key: key }) as _Object)
    listKeyCount = fallbackKeys.length
  }

  const filtered = listContents
    .map((obj) => ({
      ...obj,
      Key: obj.Key ? decodeS3Key(obj.Key) : obj.Key,
    }))
    .filter((obj) => obj.Key && isRenderableGalleryKey(obj.Key))

  console.info(
    `${logPrefix} fetched ${filtered.length}/${listKeyCount} objects from prefix "${prefix}"`,
  )

  return await Promise.all(
    filtered.map(async (obj) => {
      const key = obj.Key ?? ""
      let width = DEFAULT_WIDTH
      let height = DEFAULT_HEIGHT

      try {
        const head = await s3Client.send(
          new HeadObjectCommand({
            Bucket: bucketName,
            Key: key,
          }),
        )
        if (head.Metadata?.width && head.Metadata?.height) {
          width = Number(head.Metadata.width)
          height = Number(head.Metadata.height)
        }
      } catch {
        // Keep rendering the image even if optional object metadata is unavailable.
      }

      return buildGalleryImageFromManifestItem({ key, width, height }, cdnUrl)
    }),
  )
}

const loadGalleryManifest = async (
  s3Client: S3Client,
  bucketName: string,
  manifestKey: string,
  logPrefix: string,
): Promise<GalleryManifest | undefined> => {
  try {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: manifestKey,
      }),
    )
    const manifestText = await getBodyText(response.Body)
    if (!manifestText) {
      return undefined
    }

    const parsed = JSON.parse(manifestText) as unknown
    if (isGalleryManifest(parsed)) {
      return parsed
    }

    console.warn(`${logPrefix} ignored invalid gallery manifest at "${manifestKey}"`)
    return undefined
  } catch (error) {
    if (isMissingObjectError(error)) {
      return undefined
    }

    console.warn(
      `${logPrefix} failed to load gallery manifest, falling back to object listing`,
      error,
    )
    return undefined
  }
}

const isGalleryManifest = (value: unknown): value is GalleryManifest => {
  if (!value || typeof value !== "object") {
    return false
  }

  const maybeManifest = value as { version?: unknown; items?: unknown }
  return typeof maybeManifest.version === "number" && Array.isArray(maybeManifest.items)
}

const getBodyText = async (body: unknown): Promise<string | undefined> => {
  if (typeof body === "string") {
    return body
  }

  if (body && typeof body === "object" && "transformToString" in body) {
    const responseBody = body as { transformToString?: () => Promise<string> }
    if (typeof responseBody.transformToString === "function") {
      return await responseBody.transformToString()
    }
  }

  return undefined
}

const isMissingObjectError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false
  }

  const maybeError = error as ErrorWithMetadata
  return maybeError.$metadata?.httpStatusCode === 404 || maybeError.name === "NoSuchKey"
}

const decodeS3Key = (key: string): string => {
  try {
    return decodeURIComponent(key)
  } catch {
    return key
  }
}

const extractXmlTags = (xml: string, tagName: string): string[] => {
  const regex = new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`, "g")
  const values: string[] = []
  for (const match of xml.matchAll(regex)) {
    if (match[1]?.length) {
      values.push(match[1])
    }
  }
  return values
}

const decodeXmlEntities = (value: string): string =>
  value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll(/&#x([0-9a-fA-F]+);?/g, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replaceAll(/&#([0-9]+);?/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))

const extractListKeysFromError = async (error: unknown): Promise<string[]> => {
  if (!error || typeof error !== "object") {
    return []
  }

  const maybeError = error as ErrorWithMetadata
  const bodyText = await getBodyText(maybeError.$response?.body)
  if (!bodyText?.includes("<ListBucketResult")) {
    return []
  }

  return extractXmlTags(bodyText, "Key")
    .map((key) => decodeS3Key(decodeXmlEntities(key)))
    .filter((key) => key.length > 0)
}
