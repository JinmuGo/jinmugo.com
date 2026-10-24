#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { JSDOM } from "jsdom"

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

export function verifyLinks(distDir) {
  const files = new Set(walkFiles(distDir))
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

  for (const [route, target] of redirects) {
    if (!resolveFile(target)) {
      errors.push(`${route}: redirect target does not exist: ${target}`)
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
      if (!targetFile || targetFile !== file) {
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
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Link verification failed:\n${errors.map((error) => `- ${error}`).join("\n")}`)
  }

  return {
    htmlFiles: htmlFiles.length,
    internalLinks,
    redirects: redirects.size,
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
      `Verified ${result.internalLinks} internal links across ${result.htmlFiles} HTML files (${result.redirects} redirects).`,
    )
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
