/**
 * Import the initial content (shared/seed/content.json) into the Sanity dataset.
 *   npm run seed            -> creates documents that don't exist yet (safe to re-run)
 *   npm run seed -- --force -> overwrites existing documents with the seed version
 * Images referenced as { _seedImage: "file.jpg" } are uploaded from shared/seed/images/.
 */
import { createReadStream, readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });
const force = process.argv.includes("--force");
const SEED_DIR = resolve(process.cwd(), "../shared/seed");
const docs: Record<string, unknown>[] = JSON.parse(readFileSync(resolve(SEED_DIR, "content.json"), "utf8"));

const uploads = new Map<string, Promise<string>>();
const upload = (file: string) => {
  if (!uploads.has(file)) {
    const path = resolve(SEED_DIR, "images", file);
    uploads.set(file, client.assets.upload("image", createReadStream(path), { filename: basename(file) }).then((a) => a._id));
  }
  return uploads.get(file)!;
};

/** Upload seed images, add the _key every array item needs, drop _type where the schema decides it. */
async function prepare(value: unknown, inArray = false): Promise<unknown> {
  if (Array.isArray(value)) return Promise.all(value.map((v) => prepare(v, true)));
  if (!value || typeof value !== "object") return value;
  const obj = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  if (obj._seedImage) {
    const { _seedImage, _w, _h, _type, ...rest } = obj;
    Object.assign(out, await prepare(rest));
    out.asset = { _type: "reference", _ref: await upload(String(_seedImage)) };
    if (inArray) out._type = "image";
  } else {
    for (const [k, v] of Object.entries(obj)) out[k] = await prepare(v);
  }
  if (inArray && !out._key) out._key = randomUUID().slice(0, 12);
  return out;
}

const existing = new Set<string>(await client.fetch("*[_id in $ids]._id", { ids: docs.map((d) => d._id) }));
const todo = docs.filter((d) => force || !existing.has(String(d._id)));
if (!todo.length) {
  console.log("Nothing to import: every seed document already exists. Use --force to overwrite.");
  process.exit(0);
}

const tx = client.transaction();
for (const doc of todo) tx.createOrReplace((await prepare(doc)) as never);
await tx.commit();
console.log(`Imported ${todo.length} document(s), uploaded ${uploads.size} image(s).`);
if (existing.size && !force) console.log(`Skipped ${existing.size} existing document(s). Use --force to overwrite.`);
