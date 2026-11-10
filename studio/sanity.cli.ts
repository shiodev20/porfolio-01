import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET || "production",
  },
  // Studio is published at https://thao-educator.sanity.studio by `npm run deploy`
  studioHost: process.env.SANITY_STUDIO_HOST || "thao-educator",
  deployment: { appId: "d7s6okg1jvksl8fzt8iocicv" },
  // Allow importing ../shared (languages + seed) from the dev server
  vite: (config) => ({
    ...config,
    server: { ...config.server, fs: { ...config.server?.fs, allow: [".."] } },
  }),
});
