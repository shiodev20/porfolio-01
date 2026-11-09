import { defineConfig } from "astro/config";

export default defineConfig({
  site: process.env.SITE_URL || undefined,
  trailingSlash: "never",
  build: { format: "file" },
  vite: { server: { fs: { allow: [".."] } } },
});
