import { createImageUrlBuilder } from "@sanity/image-url";
import { sanityConfig, usingSanity, type Doc } from "./sanity";

const builder = usingSanity ? createImageUrlBuilder(sanityConfig) : null;

export type Img = { src: string; width: number; height: number };

/** Original pixel size: from the Sanity asset id ("image-<hash>-1600x1280-jpg") or the seed. */
function dimensions(image: Doc): [number, number] {
  if (image._seedImage) return [image._w, image._h];
  const m = /-(\d+)x(\d+)-\w+$/.exec(image.asset?._ref ?? "");
  const [w, h] = m ? [Number(m[1]), Number(m[2])] : [1600, 1200];
  const c = image.crop; // the editor's crop changes the aspect ratio
  return c ? [w * (1 - c.left - c.right), h * (1 - c.top - c.bottom)] : [w, h];
}

/**
 * Image URL + intrinsic size for width/height attributes (prevents layout shift).
 * `width` is the display width to request; Sanity resizes and serves WebP/AVIF.
 */
export function img(image: Doc | undefined | null, width = 1600): Img | null {
  if (!image || (!image.asset && !image._seedImage)) return null;
  const [w0, h0] = dimensions(image);
  const w = Math.min(width, Math.round(w0));
  const h = Math.round((w * h0) / w0);
  if (image._seedImage) return { src: `/seed-images/${image._seedImage}`, width: w, height: h };
  const src = builder!.image(image).width(w).fit("max").auto("format").quality(82).url();
  return { src, width: w, height: h };
}
