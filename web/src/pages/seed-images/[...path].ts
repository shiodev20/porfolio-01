// Serves shared/seed/images/* while the site runs without Sanity (seed mode).
// Generates nothing once SANITY_PROJECT_ID is set.
import type { APIRoute } from "astro";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { seedImageFiles } from "../../lib/sanity";

// npm scripts run from web/, so the seed folder is ../shared (bundling would break import.meta.url paths)
const dir = resolve(process.cwd(), "../shared/seed/images") + "/";

export function getStaticPaths() {
  return seedImageFiles().map((path) => ({ params: { path } }));
}

const types: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };

export const GET: APIRoute = async ({ params }) => {
  const file = await readFile(dir + params.path);
  const ext = params.path!.split(".").pop()!.toLowerCase();
  return new Response(file, { headers: { "Content-Type": types[ext] ?? "application/octet-stream" } });
};
