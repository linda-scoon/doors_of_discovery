# Rebuilding the lettering

`src/assets/graffiti-fonts.css` and everything in `src/assets/fonts/` are
generated. You only need this if you are adding a face, removing one, or
widening the set of characters a tag can use.

## Where the faces come from

- **Google Fonts** — Open Font Licence 1.1 or Apache 2.0.
- **dafont**, but only the ones it lists under *Public domain / GPL / OFL*.
  Most of that site's graffiti collection is "free for personal use", which
  does not cover a public site, so those are not used.

`src/assets/fonts/CREDITS.md` lists every face and where it came from.

## The steps

1. Download the face. For Google, ask for the subset directly:

   ```
   https://fonts.googleapis.com/css2?family=<Family>&text=<characters>
   ```

   and fetch the `woff2` the returned stylesheet points at. For anything
   else, start from the `.ttf` or `.otf`.

2. Subset and convert to `woff2` with `fonttools`, keeping only:

   ```
    abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'!?.-
   ```

   That is every character a tag could say. It is what keeps thirty-six
   faces to roughly the weight of one photograph.

3. Add an `@font-face` block to `src/assets/graffiti-fonts.css`, with a
   `size-adjust` that puts its cap height on the same footing as Permanent
   Marker — the hand the door sizing was built around. Without it one face
   comes out half again the size of another and the tag placement, which is
   measured against the door furniture, stops meaning anything.

4. Add the family name to `TAG_FONTS` or `SIGNATURE_FONTS` in
   `src/app/components/doors/door/door-material.ts`.

5. Add the file and its licence to `src/assets/fonts/CREDITS.md`.

## If you change what the tags say

`WORDS` in `door-material.ts` decides the wording. The subset above covers
letters, digits and a little punctuation, so new wording built from those
needs nothing else. Anything outside it — an accent, an ampersand — means
re-subsetting every face with the new characters included, or it simply
will not draw.
