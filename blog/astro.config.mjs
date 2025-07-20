import { defineConfig, fontProviders } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';
import pkg from "./package.json";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  experimental: {
    fonts: [{
      provider: fontProviders.google(),
      name: "Asta Sans",
      cssVariable: "--font-asta"
    }]
  },

  site: process.env.NODE_ENV === "development" ? "http://localhost:4321" : pkg.homepage,
  devToolbar: {
    enabled: process.env.NODE_ENV === "development"
  },
  integrations: [react(), sitemap(), icon()],

  vite: {
    plugins: tailwindcss()
  },

  markdown: {
    shikiConfig: {
      themes: {
        light: "one-light",
        dark: "one-dark-pro",
      }
    },
  },

});