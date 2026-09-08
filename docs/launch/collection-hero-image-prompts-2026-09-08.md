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

## Remaining original scenes — 2026-09-09

Four poster migrations still substituted unrelated collection featured photos. These now use conservative edits of their original banners via built-in ImageGen. Outputs are 1536 × 1024, encoded with Sharp at WebP quality 82 without resizing. Printed Tea Masters box branding is retained; overlaid marketing text and icons are removed. The organic certification badge was a flat overlay and was removed rather than regenerated.

### Tea Masters Selection

Asset: `public/images/collections/tea-masters-hero.webp`

Source: original `tea_masters.png` banner.

Use case: precise-object-edit. EDIT the supplied original Tea Masters Selection banner conservatively. Extract/reframe ONLY its existing right-hand photographic still life as a landscape 3:2 hero image. Preserve the SAME black textured cast-iron teapot with arched handle and left spout, small dark cup of tea to its right, black Teavision Tea Masters Selection box behind the cup, shallow dark oval platter of the four distinct loose tea piles in the foreground, and fresh green leaves at the right. Preserve the box's original gold printed branding. Preserve object shapes, relative positions, low camera angle, dark olive/charcoal backdrop and tabletop, subdued low-key lighting and black/gold mood. Extend only existing dark background if necessary for the crop. Remove all left-side marketing headline/subtitle, gold rules and feature icons/labels. DO NOT replace this with a tea-making process photograph, hands, people, a farm, different teaware, bright beige styling or additional props. No new creative direction. Output a faithful photographic cleanup, not a redesigned scene. No added typography or website frame.

### Wellness and functional tea

Asset: `public/images/collections/wellness-functional-tea-hero.webp`

Source: original `wellness_tea_59455684-1285-4797-a05f-0b6bb3ae9ae8.png` banner.

Use case: precise-object-edit. EDIT the supplied original Wellness & Functional Tea banner. Conservatively extract/reframe its existing right-hand photograph into a 3:2 landscape hero image. Keep the exact original warm cream speckled teapot with woven arched handle, matching cup of amber tea on its wooden coaster at front right, shallow bowl of chamomile/lavender herbal blend at front left, folded cream linen behind it, white flowering branches and green foliage behind the teapot, and purple lavender sprigs at the edges. Keep their relative arrangement, perspective, warm cream/green/purple palette and soft natural lighting. Remove only left-side marketing headline, subtitle, divider, benefit icons and green slogan strip. Preserve the subjects and scene; do not substitute a different photo, packaging, tea ingredients, props or new composition. Extend only existing pale tabletop/background if needed for the photographic crop. No printed words, symbols or added website frame.

### Speciality tea

Asset: `public/images/collections/speciality-tea-hero.webp`

Source: original `speciality_tea.png` banner.

Use case: precise-object-edit. Edit the supplied original Speciality Tea banner conservatively. Extract/reframe its right-hand photographic still life into a 3:2 landscape asset. Keep the original white porcelain gaiwan with gold rims and delicate mountain painting at upper right, small white cup of pale golden tea to the left of it, shallow cream plate of silvery loose tea leaves in the foreground, white flowering branch in the background, and pale subtly textured cloth/tabletop. Preserve all relative positions, original tea-leaf appearance, delicate porcelain details, soft white/cream/gold palette, camera angle and light. Remove only the marketing headline/subtitle, dividing artwork and benefit icons/labels on the left. Extend only the existing pale background if necessary to reframe. This should look like the same original photo with the marketing overlay removed, not a newly styled scene. No additional props, packaging, different tea varieties, people, logos, text or website frame.

### Certified organic tea

Asset: `public/images/collections/certified-organic-tea-hero.webp`

Source: original `organic_tea_6d641d5d-32cf-4674-8426-4ac32368ad8c.png` banner.

Use case: precise-object-edit. EDIT the original Australian Certified Organic Tea banner supplied. Conservatively extract and reframe its existing right-side photograph into landscape 3:2. Preserve the same shallow speckled cream ceramic bowl heaped with dried green tea leaves on a rectangular pale stone slab, the fresh green leafy branch behind it, the few loose leaves on the surface and the cream/sage linen at the right. Keep original subject shapes, relative arrangement, natural green colour, pale cream setting, camera angle and soft light. Remove the marketing headline/subtitle, divider, benefit icons and bottom green text strip. Remove the flat overlaid Australian Certified Organic badge at upper right as part of the graphic overlay; do not redraw or invent certification logos. Reframe only around the existing photography, extending plain tabletop/background if needed. No additional bowls, packaging, tea ware, fruit or props; do not restyle the scene. Output only the original-inspired photo, no words, icons, seals or website frame.

### Original service photography

Private Label Packaging, Custom Tea Blends and Dessert & Cocktail Inspired Blends now reuse full-resolution versions of their original Shopify photos. No generation or scene changes were necessary. Their original URLs and measured dimensions are recorded in `src/lib/shopify/collection-images.ts`. Portrait packaging uses `object-contain` so the complete cylinder remains visible.

Validation on 2026-09-09: all seven corrected real-Shopify collection pages returned HTTP 200, loaded their intended hero image and rendered exactly one H1. Their desktop heroes were visually inspected. Tea Masters was also inspected at 390px with no horizontal overflow. The dark teapot, branded box, platter and fresh leaves remain recognizable. All seven mapping regressions passed in the full unit suite; the Tea Masters fixture passed the collection browser suite. Full suite results are recorded in the accompanying SEO review.
