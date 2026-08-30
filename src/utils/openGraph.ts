import type { JSX } from "astro/jsx-runtime"
import satori from "satori"
import sharp from "sharp"

const REGULAR_FONT_URL = "https://cdn.jsdelivr.net/gh/fonts-archive/AstaSans/AstaSans-Regular.otf"
const BOLD_FONT_URL = "https://cdn.jsdelivr.net/gh/fonts-archive/AstaSans/AstaSans-Bold.otf"

let fontDataPromise: Promise<[ArrayBuffer, ArrayBuffer]> | undefined

function loadFontData(): Promise<[ArrayBuffer, ArrayBuffer]> {
  fontDataPromise ??= Promise.all(
    [REGULAR_FONT_URL, BOLD_FONT_URL].map(async (url) => {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch Open Graph font: ${response.status}`)
      }
      return response.arrayBuffer()
    }),
  )
    .then(([regular, bold]): [ArrayBuffer, ArrayBuffer] => [regular, bold])
    .catch((error) => {
      fontDataPromise = undefined
      throw error
    })

  return fontDataPromise
}

export async function SVG(component: JSX.Element) {
  const [regularFont, boldFont] = await loadFontData()

  return await satori(component, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "Asta Sans",
        data: regularFont,
        weight: 400,
      },
      {
        name: "Asta Sans",
        data: boldFont,
        weight: 700,
      },
    ],
  })
}

export async function PNG(component: JSX.Element) {
  return await sharp(Buffer.from(await SVG(component)))
    .png()
    .toBuffer()
}
