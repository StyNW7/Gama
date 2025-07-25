/// <reference types="vite/client" />
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["manifest.json"],
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,

            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: {
                maxEntries: 10,
                // 30 days in seconds
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
      manifest: {
        name: "Gama",
        short_name: "Gama",
        description: "Players explore real-world Indonesian landmarks, collect cultural item recipes and crafting resources, and create traditional artifacts.",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000",
        orientation: "portrait-primary",
        icons: [
          {
            src: "/PWA/logo.png",
            type: "image/png",
            sizes: "192x192",
            purpose: "any",
          },
          {
            src: "/PWA/logo.png",
            type: "image/png",
            sizes: "512x512",
            purpose: "any",
          },
        ],
        screenshots: [
          {
            src: "/PWA/logo.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide",
          },
          {
            src: "/PWA/logo.png",
            sizes: "375x667",
            type: "image/png",
          },
        ],
        lang: "en",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});