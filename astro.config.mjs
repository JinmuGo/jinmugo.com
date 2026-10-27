import react from "@astrojs/react";
import blogSitemap from "./scripts/sitemap.js";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import icon from "astro-icon";
import pkg from "./package.json";

import mdx from "@astrojs/mdx";

import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import removeConsole from 'vite-plugin-remove-console';


import remarkCallout from "@r4ai/remark-callout";
import remarkEmbedCard from "./src/utils/remark-embed-card";
import remarkImageGallery from "./src/utils/remark-image-gallery";
import remarkGfm from "remark-gfm";

import { transformerNotationDiff, transformerNotationHighlight } from "@shikijs/transformers";

// Weekly, 책, 영화는 글로 합쳤다. 예전 주소는 같은 글로 보낸다.
const movedPosts = {
  weekly: ["2026-W21", "2026-W22", "2026-W23"],
  "library/books": ["if-snow-is-silence-falling-from-the-sky", "process-economy", "where-are-we-now"],
  "library/movies": ["coffee-and-cigarettes", "midsommar", "rashomon"],
}
const movedPostRedirects = Object.fromEntries(
  ["", "/en"].flatMap((lang) => [
    ...Object.keys(movedPosts).map((section) => [`${lang}/${section}/`, `${lang}/`]),
    [`${lang}/library/`, `${lang}/`],
    ...Object.entries(movedPosts).flatMap(([section, slugs]) =>
      slugs.map((slug) => [`${lang}/${section}/${slug}/`, `${lang}/posts/${slug}/`]),
    ),
  ]),
)

// https://astro.build/config
export default defineConfig({
  site: process.env.NODE_ENV === "development" ? "http://localhost:4322" : pkg.homepage,
  output: "static",
  image: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.jinmugo.com", pathname: "/jinmu.me/**" }],
  },
  server: {
    port: 4322,
  },
  trailingSlash: "always",
  redirects: {
    ...movedPostRedirects,
    "/memos/": "/posts/",
    "/en/memos/": "/en/posts/",
    "/en/posts/leetcode-208-trie/": "/en/posts/trie-feat-leetcode-208/",
    // 예전 글 본문의 시리즈 링크를 DNS 시리즈 첫 글로 보낸다.
    "/series/": "/posts/dns-deepdive-1/",
    "/en/series/": "/en/posts/dns-deepdive-1/",
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Asta Sans",
      cssVariable: "--font-asta-sans",
      fallbacks: ["system-ui", "sans-serif"],
      weights: ["300 700"],
      subsets: ["latin", "korean"],
    },
    {
      provider: fontProviders.google(),
      name: "JetBrains Mono",
      cssVariable: "--font-jetbrains-mono",
      fallbacks: ["ui-monospace", "monospace"],
      weights: ["400 700"],
      subsets: ["latin"],
    },
  ],
  devToolbar: {
    enabled: process.env.NODE_ENV === "development",
  },
  integrations: [react(), icon(), mdx(), ...blogSitemap()],

  vite: {
    plugins: [tailwindcss(), removeConsole()],
  },

  markdown: {
    shikiConfig: {
      themes: {
        light: "one-light",
        dark: "one-dark-pro"
      },
      defaultColor: false,
      transformers: [
        transformerNotationHighlight({
          matchAlgorithm: "v3",
        }),
        transformerNotationDiff({
          matchAlgorithm: "v3",
        }),
      ],
    },
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "prepend",
          test: ["h2", "h3"],
          properties: { className: ["heading-anchor"], ariaHidden: "true", tabIndex: -1 },
          content: { type: "text", value: "#" },
        },
      ],
    ],
    remarkPlugins: [
      remarkGfm,
      [
        remarkCallout,
        {
          root: (callout) => {
            return {
              tagName: "callout-root",
              properties: {
                type: callout.type,
                isFoldable: callout.isFoldable.toString()
              },
            };
          },
          title: (callout) => ({
            tagName: "callout-title",
            properties: {
              type: callout.type,
              isFoldable: callout.isFoldable.toString(),
            },
          }),
          body: (callout) => ({
            tagName: "callout-body",
            properties: {},
          }),
        },
      ],
      remarkEmbedCard,
      remarkImageGallery,
    ]
  },
});
