#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { JSDOM } from "jsdom"
import { normalizeArchiveSegment } from "../src/utils/archive-segment.js"

const SITE_ORIGIN = new URL(
  JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8")).homepage,
).origin

function walkFiles(dir, root = dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkFiles(file, root, files)
    } else {
      files.push(path.relative(root, file).split(path.sep).join("/"))
    }
  }
  return files
}

function routeFromFile(file) {
  if (file === "index.html") {
    return "/"
  }
  if (file.endsWith("/index.html")) {
    return `/${file.slice(0, -"index.html".length)}`
  }
  return `/${file}`
}

function redirectTarget(html, route) {
  const content = html.match(
    /<meta[^>]*http-equiv=["']refresh["'][^>]*content=["']([^"']+)["']/i,
  )?.[1]
  const target = content?.match(/url=(.+)$/i)?.[1]
  return target
    ? decodedPathname(new URL(target.trim(), `${SITE_ORIGIN}${route}`).pathname)
    : undefined
}

function decodedPathname(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return undefined
  }
}

function resolvedUrl(value, route) {
  const trimmed = value.trim()
  if (!trimmed || trimmed.startsWith("#")) {
    return undefined
  }

  let url
  try {
    url = new URL(trimmed, `${SITE_ORIGIN}${route}`)
  } catch {
    return undefined
  }
  return url
}

function internalUrl(value, route) {
  const url = resolvedUrl(value, route)
  return url?.origin === SITE_ORIGIN ? url : undefined
}

function archiveRedirectMap(document, prefix, errors) {
  const redirects = new Map()
  for (const anchor of document.querySelectorAll("a[data-archive-label][href]")) {
    const label = anchor.getAttribute("data-archive-label") ?? ""
    const url = internalUrl(anchor.getAttribute("href") ?? "", `${prefix}/archives/`)
    const canonical = url && decodedPathname(url.pathname)
    const match = canonical?.match(new RegExp(`^${prefix}/archives/(category|tag|year)/([^/]+)/$`))
    if (!match) {
      errors.push(`${prefix || "/"}archives/: invalid archive link for ${JSON.stringify(label)}`)
      continue
    }

    const [, classify, segment] = match
    const expectedSegment = normalizeArchiveSegment(label)
    if (segment !== expectedSegment) {
      errors.push(
        `${prefix || "/"}archives/: ${JSON.stringify(label)} uses ${JSON.stringify(segment)} instead of ${JSON.stringify(expectedSegment)}`,
      )
      continue
    }

    const legacy = `${prefix}/archives/${classify}/${label}/`
    if (legacy !== canonical) {
      redirects.set(legacy, canonical)
    }
  }
  return redirects
}

function isCaseOnlyFilesystemCollision(legacy, canonical) {
  return legacy.normalize("NFD").toLowerCase() === canonical.normalize("NFD").toLowerCase()
}

function hasCaseInsensitivePaths(distDir, files) {
  const probe = [...files].find((file) => /[A-Za-z]/.test(file))
  if (!probe) {
    return false
  }
  const alternateCase = probe.replace(/[A-Za-z]/, (letter) =>
    letter === letter.toLowerCase() ? letter.toUpperCase() : letter.toLowerCase(),
  )
  return alternateCase !== probe && fs.existsSync(path.join(distDir, alternateCase))
}

export function verifyLinks(distDir) {
  const files = new Set(walkFiles(distDir))
  const caseInsensitivePaths = hasCaseInsensitivePaths(distDir, files)
  const filesByFoldedPath = new Map(
    [...files].map((file) => [file.normalize("NFD").toLowerCase(), file]),
  )
  const caseFoldedArchivePaths = new Set()
  const htmlFiles = [...files].filter((file) => file.endsWith(".html"))
  const routesByFile = new Map(htmlFiles.map((file) => [file, routeFromFile(file)]))
  const redirects = new Map()
  const errors = []

  const resolveFile = (pathname) => {
    const relative = pathname.replace(/^\/+/, "")
    const candidates = pathname.endsWith("/")
      ? [`${relative}index.html`]
      : [relative, `${relative}/index.html`, `${relative}.html`]
    for (const candidate of candidates) {
      const normalized = candidate.replace(/^\//, "")
      if (files.has(normalized)) {
        return normalized
      }
      if (caseInsensitivePaths && caseFoldedArchivePaths.has(pathname)) {
        const folded = filesByFoldedPath.get(normalized.normalize("NFD").toLowerCase())
        if (folded) {
          return folded
        }
      }
    }
    return undefined
  }

  for (const file of htmlFiles) {
    const route = routesByFile.get(file)
    const target = redirectTarget(fs.readFileSync(path.join(distDir, file), "utf8"), route)
    if (target) {
      redirects.set(route, target)
    }
  }

  const expectedArchiveMap = new Map()
  for (const [file, prefix] of [
    ["archives/index.html", ""],
    ["en/archives/index.html", "/en"],
  ]) {
    if (!files.has(file)) {
      errors.push(`missing archive index: /${file}`)
      continue
    }
    const document = new JSDOM(fs.readFileSync(path.join(distDir, file), "utf8"), {
      url: `${SITE_ORIGIN}${prefix}/archives/`,
    }).window.document
    for (const entry of archiveRedirectMap(document, prefix, errors)) {
      expectedArchiveMap.set(...entry)
    }
  }
  const archiveLegacyPaths = new Set(expectedArchiveMap.keys())
  for (const [legacy, canonical] of expectedArchiveMap) {
    if (isCaseOnlyFilesystemCollision(legacy, canonical)) {
      caseFoldedArchivePaths.add(canonical)
    }
  }

  for (const [route, target] of redirects) {
    if (!resolveFile(target)) {
      errors.push(`${route}: redirect target does not exist: ${target}`)
    }
  }

  for (const [legacy, canonical] of expectedArchiveMap) {
    const canonicalFile = resolveFile(canonical)
    if (!canonicalFile || redirects.has(routesByFile.get(canonicalFile))) {
      errors.push(`${legacy}: canonical archive page does not exist: ${canonical}`)
      continue
    }

    const legacyFile = resolveFile(legacy)
    if (!legacyFile) {
      if (!(caseInsensitivePaths && isCaseOnlyFilesystemCollision(legacy, canonical))) {
        errors.push(`${legacy}: legacy archive redirect does not exist`)
      }
      continue
    }

    if (
      caseInsensitivePaths &&
      legacyFile === canonicalFile &&
      isCaseOnlyFilesystemCollision(legacy, canonical)
    ) {
      continue
    }

    const builtTarget = redirects.get(routesByFile.get(legacyFile))
    if (builtTarget !== canonical) {
      errors.push(`${legacy}: expected redirect to ${canonical}, found ${builtTarget ?? "a page"}`)
    }
  }

  let internalLinks = 0
  for (const file of htmlFiles) {
    const route = routesByFile.get(file)
    const html = fs.readFileSync(path.join(distDir, file), "utf8")
    const document = new JSDOM(html, { url: `${SITE_ORIGIN}${route}` }).window.document

    for (const anchor of document.querySelectorAll("a[href]")) {
      const url = internalUrl(anchor.getAttribute("href") ?? "", route)
      if (!url) {
        continue
      }
      internalLinks++
      const pathname = decodedPathname(url.pathname)
      const targetFile = pathname ? resolveFile(pathname) : undefined
      if (!targetFile) {
        errors.push(`${route}: broken internal link: ${url.pathname}`)
      } else if (!redirects.has(route) && pathname && archiveLegacyPaths.has(pathname)) {
        errors.push(`${route}: internal link points to legacy archive redirect: ${url.pathname}`)
      }
    }

    for (const image of document.querySelectorAll("img[src]")) {
      const url = internalUrl(image.getAttribute("src") ?? "", route)
      const pathname = url && decodedPathname(url.pathname)
      if (pathname && !resolveFile(pathname)) {
        errors.push(`${route}: broken internal image: ${url.pathname}`)
      }
    }

    const canonical = document.querySelector('link[rel~="canonical"][href]')
    if (canonical && !redirects.has(route) && route !== "/404.html") {
      const url = resolvedUrl(canonical.getAttribute("href") ?? "", route)
      const pathname = url && decodedPathname(url.pathname)
      const targetFile = pathname ? resolveFile(pathname) : undefined
      if (url?.origin !== SITE_ORIGIN) {
        errors.push(`${route}: canonical must use ${SITE_ORIGIN}`)
      }
      if (!targetFile || targetFile !== file || (pathname && archiveLegacyPaths.has(pathname))) {
        errors.push(`${route}: canonical does not resolve to the current page`)
      }
    }
  }

  for (const sitemapFile of fs
    .readdirSync(distDir)
    .filter((file) => /^sitemap(?:-.*)?\.xml$/.test(file))) {
    const sitemapPath = path.join(distDir, sitemapFile)
    const document = new JSDOM(fs.readFileSync(sitemapPath, "utf8"), {
      contentType: "text/xml",
    }).window.document
    const sitemapUrls = [
      ...document.getElementsByTagName("loc"),
      ...document.getElementsByTagNameNS("*", "link"),
    ].map((node) => node.textContent || node.getAttribute("href") || "")

    for (const value of sitemapUrls) {
      const url = resolvedUrl(value, "/")
      if (!url) {
        continue
      }
      if (url.origin !== SITE_ORIGIN) {
        errors.push(`sitemap.xml: URL must use ${SITE_ORIGIN}`)
      }
      const pathname = decodedPathname(url.pathname)
      const targetFile = pathname ? resolveFile(pathname) : undefined
      if (!targetFile) {
        errors.push(`${sitemapFile}: URL does not exist: ${url.pathname}`)
      } else if (pathname && archiveLegacyPaths.has(pathname)) {
        errors.push(`${sitemapFile}: URL points to legacy archive redirect: ${url.pathname}`)
      }
    }
  }

  const archiveRedirectCounts = {
    ko: [...archiveLegacyPaths].filter((route) => !route.startsWith("/en/")).length,
    en: [...archiveLegacyPaths].filter((route) => route.startsWith("/en/")).length,
  }

  if (errors.length > 0) {
    throw new Error(`Link verification failed:\n${errors.map((error) => `- ${error}`).join("\n")}`)
  }

  return {
    htmlFiles: htmlFiles.length,
    internalLinks,
    redirects: redirects.size,
    archiveRedirectCounts,
  }
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  const distDir = path.resolve("dist")
  if (!fs.existsSync(distDir)) {
    console.error(`Build output does not exist: ${distDir}`)
    process.exit(1)
  }

  try {
    const result = verifyLinks(distDir)
    console.info(
      `Verified ${result.internalLinks} internal links across ${result.htmlFiles} HTML files (${result.redirects} redirects; archive old→new map: ko ${result.archiveRedirectCounts.ko}, en ${result.archiveRedirectCounts.en}).`,
    )
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
