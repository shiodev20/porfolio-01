/**
 * Content source.
 * - SANITY_PROJECT_ID set (web/.env) -> content is fetched from Sanity at build time
 *   (and on every request in `npm run dev`, so a Publish shows up on refresh).
 * - Not set -> the site renders from shared/seed/content.json, so it runs with no account.
 */
import { createClient } from "@sanity/client";
import seed from "../../../shared/seed/content.json";

const projectId = import.meta.env.SANITY_PROJECT_ID as string | undefined;
const dataset = (import.meta.env.SANITY_DATASET as string | undefined) || "production";

export const usingSanity = Boolean(projectId);
export const sanityConfig = { projectId: projectId ?? "", dataset };

const client = usingSanity
  ? createClient({ projectId, dataset, apiVersion: "2025-01-01", useCdn: false, perspective: "published" })
  : null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Doc = Record<string, any>;

/* ---------- Seed mode: resolve { _ref } the way GROQ's -> would ---------- */
const seedById = new Map((seed as Doc[]).map((d) => [d._id, d]));
const deref = (v: unknown): unknown => {
  if (Array.isArray(v)) return v.map(deref);
  if (v && typeof v === "object") {
    const o = v as Doc;
    if (o._type === "reference" && o._ref) return deref(seedById.get(o._ref));
    return Object.fromEntries(Object.entries(o).map(([k, x]) => [k, deref(x)]));
  }
  return v;
};

/**
 * Fetch one document by id. `projection` is the GROQ projection used with Sanity;
 * in seed mode every reference is resolved instead, which gives the same shape.
 */
export async function getDocument(id: string, projection = "{...}"): Promise<Doc> {
  if (client) {
    const doc = await client.fetch<Doc | null>(`*[_id == $id][0]${projection}`, { id });
    return doc ?? {};
  }
  return (deref(seedById.get(id)) as Doc) ?? {};
}

/** Seed image files referenced by the seed content (served by pages/seed-images). */
export const seedImageFiles = (): string[] => {
  if (usingSanity) return [];
  const files = new Set<string>();
  JSON.stringify(seed, (k, v) => (k === "_seedImage" && files.add(v), v));
  return [...files];
};
