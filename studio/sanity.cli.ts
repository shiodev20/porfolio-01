import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET || "production",
  },
  // Studio is published at https://<studioHost>.sanity.studio by `npm run deploy`
  studioHost: process.env.SANITY_STUDIO_HOST,
  // Allow importing ../shared (languages + seed) from the dev server
  vite: (config) => ({
    ...config,
    server: { ...config.server, fs: { ...config.server?.fs, allow: [".."] } },
  }),
});
