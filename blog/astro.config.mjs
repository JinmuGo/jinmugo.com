import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import icon from "astro-icon";
import pkg from "./package.json";

import mdx from "@astrojs/mdx";

import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import remarkCallout from "@r4ai/remark-callout";
import remarkEmbedCard from "./src/utils/remark-embed-card";

import { transformerNotationDiff, transformerNotationHighlight } from "@shikijs/transformers";

// https://astro.build/config
export default defineConfig({
  site: process.env.NODE_ENV === "development" ? "http://localhost:4321" : pkg.homepage,
  output: "static",
  experimental: {
    fonts: [
      {
        provider: fontProviders.google(),
        name: "Asta Sans",
        cssVariable: "--font-asta",
        weights: [300, 400, 700]
      },
      {
        provider: fontProviders.google(),
        name: "Geist",
        cssVariable: "--font-geist",
        fallbacks: ["Asta Sans"],
        weights: [300, 400, 700]
      },
    ],
  },
  devToolbar: {
    enabled: process.env.NODE_ENV === "development",
  },
  integrations: [react(), sitemap(), icon(), mdx()],

  vite: {
    plugins: tailwindcss(),
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
      rehypeAutolinkHeadings,
    ],
    remarkPlugins: [
      [
        remarkCallout,
        {
          root: (callout) => {
            return {
              tagName: "callout-root",
              properties: {
                type: callout.type,
                isFoldable: callout.isFoldable.toString(),
                defaultFolded: callout.defaultFolded?.toString(),
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
    ]
  },
});