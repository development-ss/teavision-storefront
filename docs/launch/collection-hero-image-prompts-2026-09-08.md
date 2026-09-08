# Collection hero image revision

The first three generated images were replaced at the user's request to stay closer to the original heroes. These revisions use the original Shopify banners as edit targets in the built-in ImageGen tool. They preserve the original subjects, branded packaging where present, palette, props and relative arrangement. Only marketing overlays are removed, and the photographic portion is reframed for the shared hero. The images are reference-guided edits, not pixel-identical crops.

Outputs are encoded as WebP at quality 82 without resizing; actual dimensions are 1536 × 1024. The earlier generic bowl compositions are no longer referenced by the storefront.

Validation after replacement: 556 unit tests, 11 collection browser tests and all four launch-image contracts passed. The tea and spice images were inspected in the desktop hero, and the native-ingredients image at 390px; all revised images loaded, the original subjects remained recognizable, and no mobile horizontal overflow was observed. The viewport was restored. Changes are local, not deployed.

## Wholesale tea

Asset: `public/images/collections/wholesale-tea-hero-v2.webp`

Source: original `wholesale_tea.png` banner.

Use case: precise-object-edit. Edit target: the provided original Teavision Wholesale Bulk Tea hero banner. Produce the photographic image for the right-hand panel of the website hero, landscape 3:2. Stay extremely close to this original image; this is a conservative extraction/reframing edit, not a new creative concept. Keep the original white Teavision branded stand-up pouch with its exact black logo and botanical/spice printing, its large upright presence, the same stoneware teapot with bamboo handle, bowl of rolled green tea, wooden scoop, amber tea cup, green foliage, cream stone surface, warm soft lighting and camera perspective. Preserve their relative arrangement and proportions. Reframe around the original photographic portion on the right, filling a 3:2 photograph; extend only the existing plain cream surface if needed. Remove the large left marketing headline, subtitle, benefit icons, divider artwork and green banner strip completely. Preserve the real printed branding on the pouch; do NOT make the pouch blank or invent packaging. Do not add bowls or ingredients, switch to an overhead view, restyle the scene or change its colour palette. Output only the clean photographic asset, no website frame and no additional text.

## Herbs and spices

Asset: `public/images/collections/herbs-and-spices-hero-v2.webp`

Source: original `wholesale_spices_37111047-e440-43d3-891e-54fddc0f71f9.png` banner.

Use case: precise-object-edit. Edit target: the provided original Teavision Wholesale Bulk Spices banner. Make a conservative photographic extraction for a website hero panel, landscape 3:2. Preserve the ORIGINAL overhead composition of the right-hand photograph: same diagonally angled white Teavision branded pouch with black logo and botanical/spice print, tan burlap beneath it, wooden bowls of peppercorns and dried herbs, red chilli and golden turmeric, bay leaves, cinnamon, star anise, cardamom, wooden scoop and garlic at the edges. Keep original object placement, perspective, ingredient colours, cream surface and warm lighting as closely as possible. Reframe the right-hand photographic portion to fill the 3:2 frame; extend only the existing plain cream tabletop if needed. Remove only the overlaid marketing headline/subtitle/benefit icons/green trust strip and decorative line drawings from the left. The printed Teavision logo and artwork on the physical pouch MUST remain faithful to the input. Do not invent new packaging, omit the pouch, rearrange into a generic collection of bowls, add new ingredients or restyle the photograph. Output a clean photograph without a website frame or any additional typography.

## Australian native ingredients

Asset: `public/images/collections/australian-native-ingredients-hero-v2.webp`

Source: original `australian_native_tea.png` banner.

Use case: precise-object-edit. Edit target: original Australian Native Ingredients banner supplied. Produce a conservative extraction/reframing of the original RIGHT-HAND PHOTOGRAPH for a website image panel, landscape 3:2. Preserve the original scene closely: two cream speckled ceramic bowls (large bowl of dried green leaves at upper right, smaller bowl of dried botanical pieces at centre), the original green eucalyptus-like branches and round pink blossoms across the upper area, seed pods and gumnuts, pale dried blossoms at lower left of the photo, wooden spoon with tiny tan seeds at right, and diagonal wooden scoop spilling dried leaves toward the bottom. Same cream textured stone surface, warm soft light, camera angle, colours, materials and relative object positions. Keep the original botanical subjects; do not substitute a generic leaf still life or invent more bowls, fruit or packaging. Reframe around that photographic portion to fill a 3:2 frame, extending only the existing cream surface if necessary. Completely remove left-side marketing headline, subtitle, line art, benefit icons, divider and bottom green callout strip. No typography, logos or seals anywhere. This is a faithful photographic cleanup, not a new creative composition.
