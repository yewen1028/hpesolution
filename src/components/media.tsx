import Image, { type ImageProps } from "next/image";
import { mediaBlur } from "@/lib/media-blur";

/**
 * `next/image` with the blur-up placeholder attached automatically.
 *
 * Files under `public/` are referenced by path rather than statically
 * imported, so Next has no way to derive a `blurDataURL` for them and every
 * image on this site painted as a hard pop-in. `scripts/gen-blur.mjs` bakes a
 * 12px base64 version of each file into `lib/media-blur.ts`; this looks the
 * path up and passes it through.
 *
 * A miss is not an error — an image with no generated placeholder renders
 * exactly as a plain `<Image>` would. That keeps the map optional: forget to
 * re-run the script after adding a photo and you lose the blur-up, not the
 * picture.
 *
 * Server component. There is no state here, only a lookup, so this adds
 * nothing to the client bundle beyond the placeholder string itself.
 */
// `alt` is destructured rather than left in the spread so it is visibly passed
// on every branch — `jsx-a11y/alt-text` cannot see through `{...props}`, and
// silencing the rule would also silence a genuine omission later.
export function Media({ src, alt, ...props }: ImageProps) {
  const blurDataURL = typeof src === "string" ? mediaBlur[src] : undefined;

  if (!blurDataURL) {
    return <Image src={src} alt={alt} {...props} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      placeholder="blur"
      blurDataURL={blurDataURL}
      {...props}
    />
  );
}
