# Hero image regeneration

Generated with the built-in image generation tool on 2026-09-07 using the original homepage PNG as a composition reference. The output was copied byte-for-byte to `public/images/homepage/hero-still-life-v2.png`; no sharpening, resizing, retouching, or pixel manipulation was applied.

Requested width: 3840 pixels. Actual native output: 1859 × 846 pixels. This candidate is not a 4K master.

## Integration and verification

- Updated the Storybook homepage hero fixture to use the new local asset and its actual dimensions.
- Reviewed the existing hero at desktop and 390 × 844 mobile viewport sizes in Storybook. The heading, body copy, CTA and proof points remain visible; the centered mobile crop shows the cup and teapot.
- Verified that the workspace PNG is byte-identical to the generated output (SHA-256: `7c1c84deb08f6c408c6daad3afa2f54a4df56b64e27e489f6eb0becce707bd24`).
- Updated only `homePage.hero.image.image.asset` in the configured Sanity production dataset, using a revision guard, and read the document back to verify the new reference.
- New asset: `image-cf3068d40f42e7440c37096edfbdddc954addf2f-1859x846-png`.
- Original asset retained for rollback: `image-cb321d54494d7e15ad2acb75592f78fce8e08194-1440x650-png`.
- No changes to hero layout, overlays or Next.js image processing. Storybook review does not verify production cache refresh or optimized image quality; large high-density displays remain constrained by the native output resolution.

## Generation prompt

Use case: photorealistic-natural.
Asset type: wide website homepage hero photograph.
Input image 1 is a composition and subject reference only. Regenerate the scene as a new, convincing real photograph; do not enhance, sharpen, upscale, filter, or retouch the input pixels.
Recreate the overhead tea still life: warm light limestone surface with generous quiet empty space across the left half for website text, and the tea arrangement occupying the right half. Preserve the reference layout: black textured ceramic teapot partially cropped at the top, spout pointing down-left; small cup of pale golden green tea near the upper center; dark round shallow bowl of irregular dried green tea leaves on a diagonal natural bamboo mat at the right; small bamboo scoop resting in the leaves; another wooden scoop and a few scattered tea leaves near the lower-right; second tea cup cropped at the lower-right edge; a subtle real green sprig entering from the upper-right.
Make this feel like restrained professional still-life photography captured from directly overhead with a good normal lens, enough depth of field for the tabletop and tea objects to resolve naturally. Soft diffuse daylight, physically consistent gentle contact shadows, restrained warm neutral color, realistic tea translucency and subtle reflections. Unglazed ceramic has fine understated material texture, individual dried leaves have varied credible shapes and muted olive/brown color, bamboo has coherent straight structure, stone has subtle irregular mineral detail. Natural clarity without exaggerated microcontrast. Keep highlights and shadows photographic, not HDR. Do not bake a dark website overlay or vignette into the photo.
Preserve the wide framing of the reference, approximately 2.2:1. Target native output 3840 pixels wide (approximately 3840 x 1744) if supported. Compose for a large full-width hero, with visually quiet left side. No text, logos, watermark, extra props, artificial bokeh, smeared texture, repeated leaves, malformed cup rims, impossible teapot geometry, plastic surfaces, sharpening halos, crunchy edges, oversaturation or CGI appearance.
