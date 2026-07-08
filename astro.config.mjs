import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import icon from "astro-icon";
import pkg from "./package.json";

import mdx from "@astrojs/mdx";

import rehypeSlug from "rehype-slug";
import removeConsole from 'vite-plugin-remove-console';


import remarkCallout from "@r4ai/remark-callout";
import remarkEmbedCard from "./src/utils/remark-embed-card";
import remarkImageGallery from "./src/utils/remark-image-gallery";
import remarkGfm from "remark-gfm";

import { transformerNotationDiff, transformerNotationHighlight } from "@shikijs/transformers";

// https://astro.build/config
export default defineConfig({
  site: process.env.NODE_ENV === "development" ? "http://localhost:4322" : pkg.homepage,
  output: "static",
  server: {
    port: 4322,
  },
  trailingSlash: "always",
  redirects: {
    "/memos/": "/posts/",
    "/en/memos/": "/en/posts/",
    "/posts/process-economy/": "/library/books/process-economy/",
    "/posts/where-are-we-now/": "/library/books/where-are-we-now/",
    "/posts/if-snow-is-silence-falling-from-the-sky/": "/library/books/if-snow-is-silence-falling-from-the-sky/",
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Geist",
      cssVariable: "--font-geist",
      fallbacks: ["Pretendard"],
      weights: [300, 400, 600]
    },
  ],
  devToolbar: {
    enabled: process.env.NODE_ENV === "development",
  },
  integrations: [react(), icon(), mdx()],

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