/**
 * Everything that makes one door different from the next.
 *
 * Every property is derived from the door's id by hashing, with a different
 * seed per property so they vary independently rather than moving together.
 * The same id always produces the same door, so a door keeps its identity
 * between visits — nothing here is random.
 *
 * The point of all this is scrolling: with only a colour and a face to vary,
 * a near-identical door turned up after seven of them. Each axis added here
 * multiplies the total, and they are cheap because they are all just hashes.
 */

/*
 * No symbols or lettering on a door. Marks acquire meanings their author
 * never intended — a diagonal brace across two rails reads as a letter Z,
 * which is why that design is not here.
 *
 * House numbers are the exception, because a number on a door is a house
 * number and reads as nothing else. A short list of them is skipped all the
 * same: a handful of two-digit numbers are established extremist codes, and
 * with doors generated endlessly nobody would be reviewing the one that
 * came up. Graffiti is drawn as loops and arcs, never anything legible.
 */

export type DoorMaterial = 'wood' | 'glass' | 'stone' | 'metal';

/** The face of the door — its joinery, glazing, or lack of either. */
export type DoorDesign =
  | 'four-panel'
  | 'six-panel'
  | 'two-panel'
  | 'planked'
  | 'glazed-top'
  | 'porthole'
  | 'studded'
  | 'arched'
  | 'panes'
  | 'leaded'
  | 'frosted'
  | 'carved'
  | 'ledged'
  | 'slab';

/** How a door behaves when someone tries to open it. */
export type OpenStyle = 'swing' | 'creak' | 'stuck';

/** What the handle, knocker and letterbox are made of. */
export type Finish = 'brass' | 'chrome' | 'iron' | 'nickel';

/** How well kept the door is. */
export type Wear = 'clean' | 'scuffed' | 'peeling';

/**
 * The unusual thing a door does, if it does anything.
 *
 * Most doors are ordinary. These are rare on purpose: a surprise that
 * happens on every third door is not a surprise.
 */
export type Surprise =
  | 'none'
  | 'crack'
  | 'fire'
  | 'monster'
  | 'knocks-back'
  /** Somebody inside calls out, and then lets you in. */
  | 'answers'
  /** No handle needed: touch it and it swings. */
  | 'opens-on-tap';

/**
 * The variables that make one tag different from the next.
 *
 * Without these every tagged door carried an identical mark in an identical
 * place, which reads as a stamp rather than as graffiti.
 */
export type GraffitiKind = 'words' | 'signature' | 'cat';

/**
 * What the paint did after it left the can.
 *
 * `single` is one run from a letter. `curtain` is a whole row of runs, the
 * look of a can held still for too long. `splash` is paint flung at the
 * door rather than sprayed. `soft` is overspray: sprayed from too far back,
 * so nothing quite has an edge.
 */
export type DripStyle = 'single' | 'curtain' | 'splash' | 'soft';

/**
 * Paint that ran off a letter.
 *
 * Runs belong to a line of the lettering rather than to the door, because
 * paint comes off a letter -- it does not appear in the gap after the last
 * word. A run off the top line is long enough to pass the line below it.
 */
export interface PaintRun {
  /** Across that line of lettering, as a percentage of its width. */
  x: number;
  /** How thick the run is, in pixels. */
  thickness: number;
  /** How far it runs, in hundredths of the door's width. */
  length: number;
}

/** One line of the lettering, and whatever ran off it. */
export interface TagLine {
  text: string;
  runs: PaintRun[];
}

/** A speck of a splash: paint thrown at the door, off no letter at all. */
export interface PaintSpeck {
  /** Across the door, as a percentage of its width. */
  x: number;
  /** Down the door, as a percentage of its height. */
  y: number;
  /** How wide the speck is, in pixels. */
  size: number;
  /** How far the heavy ones ran afterwards, in hundredths of the width. */
  tail: number;
}

export interface GraffitiTag {
  /** Whether this one is a tag, a signature, or a drawing. */
  kind: GraffitiKind;
  /** The lines sprayed, for a tag. Empty for a drawing. */
  lines: TagLine[];
  /** The hand it was written in. */
  font: string;
  /** The paint colour, and the darker outline sprayed behind it. */
  hue: number;
  /** A second colour, for the drip and the highlight. */
  hueAccent: number;
  /** Where the whole tag sits, as a percentage offset. */
  shiftX: number;
  shiftY: number;
  /** How far it is turned, in degrees. */
  rotate: number;
  /** How big it is, as a multiplier. */
  scale: number;
  /** What the paint did on its way down the door. */
  drip: DripStyle;
  /** Paint flung at the door. Only a splash has any. */
  specks: PaintSpeck[];
}

/** Everything about one door. */
export interface DoorCharacter {
  material: DoorMaterial;
  design: DoorDesign;
  colour: string;
  handleSide: 'left' | 'right';
  openStyle: OpenStyle;
  finish: Finish;
  wear: Wear;
  hasKnocker: boolean;
  hasLetterbox: boolean;
  hasKickPlate: boolean;
  hasPeephole: boolean;
  /** Someone has been at this one with a spray can. */
  hasGraffiti: boolean;
  /** How that particular tag was sprayed. Null when the door is clean. */
  graffiti: GraffitiTag | null;
  /** The number on the door, or null when it has no number plate. */
  number: number | null;
  surprise: Surprise;
}

/* ------------------------------------------------------------- the hash */

/**
 * Turns a string into a number between 0 and 1, the same way every time.
 *
 * FNV-1a: short, and it spreads similar strings like "room-7" and "room-8"
 * far apart, which matters because consecutive doors sit next to each other.
 */
function hashToFraction(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return ((hash >>> 0) % 100_000) / 100_000;
}

/** Picks one item from a list, the same one every time for a given seed. */
function pick<T>(items: readonly T[], seed: string): T {
  const index = Math.floor(hashToFraction(seed) * items.length);
  return items[Math.min(index, items.length - 1)];
}

/** Picks from a list where some entries should come up more often. */
function pickWeighted<T>(entries: ReadonlyArray<[T, number]>, seed: string): T {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let position = hashToFraction(seed) * total;

  for (const [value, weight] of entries) {
    position -= weight;
    if (position < 0) return value;
  }
  return entries[entries.length - 1][0];
}

/** True for roughly the given share of ids. */
function chance(seed: string, probability: number): boolean {
  return hashToFraction(seed) < probability;
}

/* -------------------------------------------------------------- the mix */

const MATERIAL_WEIGHTS: ReadonlyArray<[DoorMaterial, number]> = [
  ['wood', 52],
  ['metal', 18],
  ['glass', 16],
  ['stone', 14],
];

/**
 * Which faces suit which material. Glass and stone used to have two each,
 * which is why they repeated after three or four doors; they have four now.
 */
const DESIGNS_BY_MATERIAL: Record<DoorMaterial, readonly DoorDesign[]> = {
  wood: ['four-panel', 'six-panel', 'two-panel', 'planked', 'glazed-top', 'ledged'],
  metal: ['studded', 'slab', 'porthole', 'two-panel'],
  glass: ['panes', 'glazed-top', 'leaded', 'frosted'],
  stone: ['arched', 'slab', 'carved', 'two-panel'],
};

/**
 * How each material takes colour.
 *
 * Wood and metal are painted, so they get the full spectrum. Glass and stone
 * are the material's own colour, but their ranges are wider than they were —
 * a 26-degree band gave stone six looks in total.
 */
const MATERIAL_LOOK: Record<
  DoorMaterial,
  { hueFrom: number; hueTo: number; saturation: number; lightness: number }
> = {
  wood: { hueFrom: 0, hueTo: 360, saturation: 46, lightness: 38 },
  metal: { hueFrom: 0, hueTo: 360, saturation: 30, lightness: 52 },
  glass: { hueFrom: 120, hueTo: 290, saturation: 34, lightness: 62 },
  stone: { hueFrom: 0, hueTo: 300, saturation: 11, lightness: 46 },
};

/*
 * Most doors just open. A creak is a small event and a stuck door is an
 * annoyance, so both should be uncommon — at a quarter and a twelfth of
 * every door they had stopped being either.
 */
const OPEN_STYLE_WEIGHTS: ReadonlyArray<[OpenStyle, number]> = [
  ['swing', 90],
  ['creak', 9],
  // Barely any door is stuck for no reason. Most of the ones that will not
  // open are the knocking kind, which are worth meeting; a door that simply
  // refuses and does nothing else is only an obstacle.
  ['stuck', 1],
];

const SURPRISE_WEIGHTS: ReadonlyArray<[Surprise, number]> = [
  ['none', 72],
  ['crack', 8],
  ['fire', 6],
  ['monster', 5],
  ['knocks-back', 4],
  ['answers', 3],
  ['opens-on-tap', 2],
];

const FINISHES: readonly Finish[] = ['brass', 'chrome', 'iron', 'nickel'];
const WEARS: readonly Wear[] = ['clean', 'clean', 'scuffed', 'peeling'];

/* ------------------------------------------------------- the properties */

export function materialForDoor(id: string): DoorMaterial {
  return pickWeighted(MATERIAL_WEIGHTS, `${id}:material`);
}

export function designForDoor(id: string, material: DoorMaterial): DoorDesign {
  return pick(DESIGNS_BY_MATERIAL[material], `${id}:design`);
}

/**
 * The faces with nothing on them: no panels, no studs, no window, no arch.
 *
 * Only these carry a number. A plate screwed across a panel edge or over an
 * arch reads as a mistake rather than as an address, and every material has
 * one of these so any door can be given a number if it has to be.
 */
const PLAIN_DESIGNS: readonly DoorDesign[] = ['slab', 'planked', 'frosted'];

export function isPlainDesign(design: DoorDesign): boolean {
  return PLAIN_DESIGNS.includes(design);
}

/**
 * The colour of a door. This is why adding an API does not mean choosing a
 * hex code: a new room gets a colour that suits its material, and keeps it.
 */
export function colourForDoor(id: string, material: DoorMaterial): string {
  const look = MATERIAL_LOOK[material];
  const spread = look.hueTo - look.hueFrom;
  const hue = Math.round(look.hueFrom + hashToFraction(`${id}:hue`) * spread);
  // Lightness varies a little too, so two doors of the same hue still differ.
  const lightness = look.lightness + Math.round(hashToFraction(`${id}:light`) * 14) - 7;

  return `hsl(${hue} ${look.saturation}% ${lightness}%)`;
}

/**
 * A surprise has to be reachable to be worth having, so a door that breathes
 * fire or hides a monster is never also stuck.
 */
function openStyleForDoor(id: string, surprise: Surprise): OpenStyle {
  if (surprise === 'knocks-back') return 'stuck';

  // A surprise has to be reachable, so none of these are ever stuck, and a
  // door that opens itself does not also creak its way round.
  if (surprise === 'opens-on-tap' || surprise === 'answers') return 'swing';
  if (surprise === 'fire' || surprise === 'monster') {
    return pickWeighted([['swing', 80], ['creak', 20]], `${id}:open`);
  }
  return pickWeighted(OPEN_STYLE_WEIGHTS, `${id}:open`);
}

/**
 * What a door was tagged with.
 *
 * Mostly the site's own name, sometimes a signature, now and then a cat.
 * Real graffiti is lettering, so these are words in a marker hand rather
 * than abstract loops, which looked like a decal.
 */
/**
 * The hands a tag can be written in.
 *
 * Spray and marker faces for a tag, scripts for a signature. Every one is
 * served from this site -- see src/assets/fonts/CREDITS.md for where each
 * came from and under what licence -- and every one has to be declared in
 * src/assets/graffiti-fonts.css, or a door written in it falls back to
 * whatever cursive face the browser happens to have.
 */
const TAG_FONTS: readonly string[] = [
  "'Aaaiight'",
  "'Beatstreet'",
  "'Caveat Brush'",
  "'Degrassi'",
  "'Desiderium'",
  "'Don Graffiti'",
  "'Dripping Marker'",
  "'Freedom Street'",
  "'Graffiti Style'",
  "'Graffiti Treat'",
  "'Graffonti'",
  "'Grafitik Riot'",
  "'Lacquer'",
  "'Maelstrom'",
  "'Most Wasted'",
  "'Muro'",
  "'Permanent Marker'",
  "'Planet Benson'",
  "'Rock Salt'",
  "'Rubik Marker Hatch'",
  "'Rubik Spray Paint'",
  "'Rubik Wet Paint'",
  "'Sedgwick Ave Display'",
  "'Souper'",
  "'Soychango'",
  "'Spray Tag'",
  "'Stab'",
  "'Subway'",
  "'Thirsty Caps'",
  "'Whoa'",
  "'Zit Graffiti'",
];

const SIGNATURE_FONTS: readonly string[] = [
  "'Caveat'",
  "'Dancing Script'",
  "'Just Another Hand'",
  "'Nanum Pen Script'",
  "'Reenie Beanie'",
];

/** What each kind of tag says, a line at a time. */
const WORDS: Record<'words' | 'signature', string[]> = {
  words: ['web of', 'doors'],
  signature: ['Linda'],
};

const GRAFFITI_KINDS: ReadonlyArray<[GraffitiKind, number]> = [
  ['words', 58],
  ['cat', 24],
  ['signature', 18],
];

/**
 * How the paint ran. Most tags have the one run; the rest are rarer so
 * that coming across a splash or a curtain of runs still registers.
 */
const DRIP_STYLES: ReadonlyArray<[DripStyle, number]> = [
  ['single', 44],
  ['curtain', 22],
  ['splash', 20],
  ['soft', 14],
];

/**
 * Which stretches of the door already have something screwed to them.
 *
 * Each entry is [top, bottom] as a percentage of the door's height, and
 * they match where door.component.css actually puts each piece. The handle
 * is always there, so it is always in the list.
 */
function furnitureBands(furniture: DoorFurniture): Array<[number, number]> {
  // A little wider than each piece really is. A tag is sprayed at an angle,
  // so its corners reach further than the lettering suggests, and paint
  // that just grazes a handle still looks like it was meant to miss.
  const margin = 2;
  const band = (top: number, bottom: number): [number, number] => [
    top - margin,
    bottom + margin,
  ];

  // Measured in a browser rather than read off the stylesheet. The handle
  // in particular runs to 63% on a narrow door, not the 52% its `top` and
  // percentage height suggest, because its plate has a fixed height in
  // pixels -- and a tag was landing on the bottom of it on phones.
  const bands: Array<[number, number]> = [band(43, 63)]; // the handle

  if (furniture.hasNumber) bands.push(band(10, 18));
  if (furniture.hasPeephole) bands.push(band(16, 23));
  if (furniture.hasKnocker) bands.push(band(25, 36));
  if (furniture.hasLetterbox) bands.push(band(55, 62));
  if (furniture.hasKickPlate) bands.push(band(81, 96));

  return bands.sort((a, b) => a[0] - b[0]);
}

/**
 * How tall a two-line tag is at scale 1, as a percentage of the door's
 * height. Generous on purpose: a tag is sprayed at an angle, so it takes up
 * more room than the lettering alone. `scale` multiplies this, so a tag's
 * real height is always TAG_HEIGHT * scale.
 */
const TAG_HEIGHT = 19;

/**
 * Finds the clear stretches of door between the furniture.
 *
 * Returns them widest first. A tag goes in one of these rather than in the
 * middle of the door, because the middle of the door is exactly where the
 * letterbox is -- and since paint now goes under the furniture rather than
 * over it, a tag placed there is a tag with its second line hidden.
 */
function clearBands(furniture: DoorFurniture): Array<[number, number]> {
  const gaps: Array<[number, number]> = [];
  let edge = 5; // The paint stops short of the very top and bottom.

  for (const [top, bottom] of furnitureBands(furniture)) {
    if (top > edge) gaps.push([edge, top]);
    edge = Math.max(edge, bottom);
  }
  if (edge < 95) gaps.push([edge, 95]);

  return gaps.sort((a, b) => b[1] - b[0] - (a[1] - a[0]));
}

/** What is screwed to a door, as far as placing a tag is concerned. */
interface DoorFurniture {
  hasKnocker: boolean;
  hasLetterbox: boolean;
  hasKickPlate: boolean;
  hasPeephole: boolean;
  hasNumber: boolean;
}

function graffitiFor(
  id: string,
  ordinal: number,
  furniture: DoorFurniture
): GraffitiTag {
  const spread = (seed: string, from: number, to: number) =>
    Math.round(from + hashToFraction(`${id}:${seed}`) * (to - from));

  const kind = pickWeighted(GRAFFITI_KINDS, `${id}:tagkind`);

  // Stepping round the colour wheel by position rather than hashing it. A
  // hash clumps, so several tags in view came out much the same pink. A
  // stride of 47 degrees is coprime with 360, which puts consecutive tags
  // far apart and uses every hue on the wheel before any repeats.
  const hue = (ordinal * 47) % 360;

  const drip = pickWeighted(DRIP_STYLES, `${id}:dripstyle`);
  const placement = placeTag(id, furniture);

  return {
    kind,
    // Split into lines here rather than left to wrap, because a run has
    // to know which line it came off.
    lines: taggedLines(id, drip, kind === 'cat' ? [] : WORDS[kind]),
    // A signature is somebody's name, so it gets a script; a tag gets a
    // marker or a spray can.
    font: pick(
      kind === 'signature' ? SIGNATURE_FONTS : TAG_FONTS,
      `${id}:tagfont`
    ),
    hue,
    // Offset round the wheel, so a tag looks like one person's two cans
    // rather than two unrelated colours.
    hueAccent: (hue + spread('tagaccent', 110, 250)) % 360,
    // Kept modest on purpose. The paint is clipped to the door, so a big
    // shift does not spill onto the frame any more -- it just loses a
    // letter off the side, which looks worse than a tag that fits.
    shiftX: spread('tagx', -6, 6),
    rotate: spread('tagrot', -14, 14),
    ...placement,
    drip,
    specks: paintSpecks(id, drip, placement),
  };
}

/**
 * Where the letters are along one line, as percentages across it.
 *
 * Every character is treated as the same width, which is close enough in a
 * marker hand. Spaces are skipped, so a run never falls out of the gap
 * between two words or off the end of the line -- which is exactly what it
 * was doing when runs were spread evenly across a fixed band instead.
 */
function letterStops(line: string): number[] {
  const stops: number[] = [];

  for (let i = 0; i < line.length; i += 1) {
    if (line[i] === ' ') continue;
    stops.push(Math.round(((i + 0.5) / line.length) * 100));
  }
  return stops;
}

/**
 * The lettering, with the paint that ran off it.
 *
 * Runs hang off particular letters, picked by hash from every letter on
 * the tag. They can come off either line: one from the top line simply
 * runs further, down past the line beneath it.
 */
function taggedLines(id: string, drip: DripStyle, words: string[]): TagLine[] {
  // A splash was thrown at the door and ran off nothing.
  const count =
    drip === 'splash'
      ? 0
      : drip === 'curtain'
        ? 5 + Math.floor(hashToFraction(`${id}:curtain`) * 4)
        : 1;

  // Every letter on the tag, as somewhere a run could start.
  const letters = words.flatMap((word, line) =>
    letterStops(word).map((x) => ({ line, x }))
  );

  // Shuffled by hash and taken from the front, which picks `count` of them
  // without ever picking the same letter twice.
  const chosen = letters
    .map((letter, i) => ({ letter, order: hashToFraction(`${id}:run${i}`) }))
    .sort((a, b) => a.order - b.order)
    .slice(0, count)
    .map(({ letter }) => letter);

  return words.map((text, line) => ({
    text,
    runs: chosen
      .filter((letter) => letter.line === line)
      .map((letter, i) => ({
        x: letter.x,
        thickness: Math.round(2 + hashToFraction(`${id}:thick${line}${i}`) * 2),
        // A run off an upper line has to get past the lines below it
        // before it looks like it ran at all.
        length: Math.round(
          10 +
            (words.length - 1 - line) * 16 +
            hashToFraction(`${id}:len${line}${i}`) * 26
        ),
      })),
  }));
}

/**
 * Paint thrown at the door rather than sprayed on it.
 *
 * Placed by angle and distance from the middle of the tag rather than
 * inside a box. The distance is deliberately not square-rooted: that would
 * spread the specks evenly over the circle, and a splash is thickest where
 * it hit.
 */
function paintSpecks(
  id: string,
  drip: DripStyle,
  placement: { shiftY: number; scale: number }
): PaintSpeck[] {
  if (drip !== 'splash') return [];

  const middle = 50 + placement.shiftY;
  const count = 11 + Math.floor(hashToFraction(`${id}:splash`) * 6);
  const of = (index: number, part: string) =>
    hashToFraction(`${id}:speck${index}:${part}`);

  return Array.from({ length: count }, (_unused, i) => {
    const angle = of(i, 'angle') * Math.PI * 2;
    const distance = of(i, 'dist');
    // Most specks are small and a few are big, rather than all middling.
    const weight = of(i, 'size') ** 2;

    return {
      x: Math.round(50 + Math.cos(angle) * distance * 34),
      y: Math.round(middle + Math.sin(angle) * distance * 15),
      size: Math.round(2 + weight * 10),
      // Only the heaviest ran at all before they dried.
      tail: weight > 0.55 ? Math.round(4 + of(i, 'tail') * 10) : 0,
    };
  });
}
/**
 * Where the tag goes and how big it is.
 *
 * The two decisions are made together because they depend on each other:
 * the tag goes in a clear stretch of door, and if the only clear stretch is
 * a short one the tag is sprayed smaller to fit it. A door carrying every
 * piece of furniture has no gap a full-size tag fits in, so without this a
 * tag on one of those would always end up across the kick plate.
 */
function placeTag(
  id: string,
  furniture: DoorFurniture
): { shiftY: number; scale: number } {
  const bands = clearBands(furniture);
  const wanted = 0.78 + hashToFraction(`${id}:tagscale`) * 0.3;

  // The bands a tag of the size we wanted would fit in. Picking among them
  // rather than always taking the tallest keeps two doors with the same
  // furniture from being tagged in the same place.
  const roomy = bands.filter(
    ([top, bottom]) => bottom - top >= TAG_HEIGHT * wanted
  );

  const [top, bottom] = roomy.length
    ? roomy[Math.floor(hashToFraction(`${id}:tagband`) * roomy.length)]
    : bands[0];

  // A percent of margin, so rounding the offset below cannot nudge the
  // paint onto the furniture.
  const room = bottom - top - 1;
  const scale = Math.min(wanted, room / TAG_HEIGHT);

  const slack = (room - TAG_HEIGHT * scale) / 2;
  const jitter = (hashToFraction(`${id}:tagy`) * 2 - 1) * slack;

  return {
    shiftY: Math.round((top + bottom) / 2 + jitter - 50),
    scale,
  };
}

/**
 * Numbers that are not used, because they are known extremist codes rather
 * than ordinary house numbers.
 */
const SKIPPED_NUMBERS = new Set([14, 18, 88]);

/**
 * The number on a door, from its position along the wall.
 *
 * Taken from position rather than a hash so that no two doors in a long run
 * share a number: multiplying by a value coprime with the range steps
 * through every number once before repeating, which scatters them instead
 * of counting up.
 */
function numberForDoor(ordinal: number): number | null {
  const range = 499;
  const stride = 137; // Coprime with the range, so nothing repeats early.
  const number = ((ordinal * stride) % range) + 1;

  return SKIPPED_NUMBERS.has(number) ? null : number;
}

/**
 * The number nobody wants. In the West 13 is the unlucky one — the floor
 * hotels skip, the guest you do not seat. A door numbered 13 always has
 * something unpleasant behind it, and always shows its number, so the
 * superstition is earned rather than coincidental.
 */
const UNLUCKY_NUMBER = 13;

/** What waits behind a 13. None of these options is nothing. */
const UNLUCKY_SURPRISES: ReadonlyArray<[Surprise, number]> = [
  ['monster', 38],
  ['fire', 34],
  ['knocks-back', 28],
];

/**
 * Everything about one door, in one go.
 *
 * `ordinal` is the door's place along the wall, used only for its number.
 * Everything else comes from the id, so a door's appearance does not depend
 * on where it happens to sit.
 */
export function characterForDoor(id: string, ordinal = 0): DoorCharacter {
  const material = materialForDoor(id);

  const positionalNumber = numberForDoor(ordinal);
  const isUnlucky = positionalNumber === UNLUCKY_NUMBER;

  // A 13 always shows its number -- a superstition nobody can see is not
  // worth having -- and only a plain door carries a number at all, so a 13
  // is given a plain face to show it on.
  const design = isUnlucky
    ? pick(DESIGNS_BY_MATERIAL[material].filter(isPlainDesign), `${id}:face`)
    : designForDoor(id, material);

  // A number goes on a flat door and nowhere else. Likelier than it was,
  // because far fewer doors are now eligible for one.
  const number = !isPlainDesign(design)
    ? null
    : isUnlucky
      ? UNLUCKY_NUMBER
      : chance(`${id}:plate`, 0.7)
        ? positionalNumber
        : null;

  const surprise = isUnlucky
    ? pickWeighted(UNLUCKY_SURPRISES, `${id}:unlucky`)
    : pickWeighted(SURPRISE_WEIGHTS, `${id}:surprise`);

  // Worked out before the tag, because where a tag goes depends on what is
  // already screwed to the door.
  const furniture: DoorFurniture = {
    hasKnocker: chance(`${id}:knocker`, 0.35),
    hasLetterbox: chance(`${id}:letterbox`, 0.4),
    hasKickPlate: chance(`${id}:kickplate`, 0.33),
    hasPeephole: chance(`${id}:peephole`, 0.3),
    hasNumber: number !== null,
  };

  const hasGraffiti = chance(`${id}:graffiti`, 0.12);

  return {
    material,
    design,
    colour: colourForDoor(id, material),
    handleSide: chance(`${id}:side`, 0.3) ? 'left' : 'right',
    openStyle: openStyleForDoor(id, surprise),
    finish: pick(FINISHES, `${id}:finish`),
    wear: pick(WEARS, `${id}:wear`),
    hasKnocker: furniture.hasKnocker,
    hasLetterbox: furniture.hasLetterbox,
    hasKickPlate: furniture.hasKickPlate,
    hasPeephole: furniture.hasPeephole,
    hasGraffiti,
    graffiti: hasGraffiti ? graffitiFor(id, ordinal, furniture) : null,
    number,
    surprise,
  };
}

/** How many panels a panelled design has. Other designs have none. */
export function panelCountForDesign(design: DoorDesign): number {
  switch (design) {
    case 'six-panel':
      return 6;
    case 'four-panel':
    case 'panes':
      return 4;
    case 'leaded':
      return 9;
    case 'two-panel':
    case 'glazed-top':
      return 2;
    default:
      return 0;
  }
}

/* ------------------------------------------------------------- the size */

/**
 * How much of the wall a door takes up.
 *
 * The wall is a grid of door-shaped cells, and a door covers a block of
 * them. The four square sizes keep a door's proportions and only change its
 * scale; the other two are cupboards -- a broom cupboard twice the usual
 * height for its width, and a low one as wide as it is tall.
 */
export type DoorSize = 'tiny' | 'standard' | 'big' | 'huge' | 'tall' | 'wide';

/** The block of cells each size covers, as columns by rows. */
export const DOOR_SPANS: Readonly<Record<DoorSize, { cols: number; rows: number }>> = {
  tiny: { cols: 1, rows: 1 },
  standard: { cols: 2, rows: 2 },
  big: { cols: 3, rows: 3 },
  huge: { cols: 4, rows: 4 },
  tall: { cols: 1, rows: 2 },
  wide: { cols: 2, rows: 1 },
};

/*
 * Plenty of single-column doors on purpose. The grid fills a gap with the
 * next door that fits it, and the gaps a big door leaves beside itself are
 * one column wide; without enough narrow doors to drop into them the wall
 * would be full of holes.
 */
const SIZE_WEIGHTS: ReadonlyArray<[DoorSize, number]> = [
  ['standard', 44],
  ['tiny', 22],
  ['big', 11],
  ['tall', 10],
  ['wide', 8],
  ['huge', 5],
];

/*
 * A door with something behind it is never smaller than usual. What is in
 * the room has to be readable through the doorway, and a cupboard is not
 * the place for a film trailer.
 */
const ROOM_SIZE_WEIGHTS: ReadonlyArray<[DoorSize, number]> = [
  ['standard', 60],
  ['big', 30],
  ['huge', 10],
];

/**
 * The size of a door, the same every time for a given id, so a door keeps
 * its size wherever it ends up on the wall.
 */
export function sizeForDoor(id: string, hasContents: boolean): DoorSize {
  return pickWeighted(
    hasContents ? ROOM_SIZE_WEIGHTS : SIZE_WEIGHTS,
    `${id}:size`
  );
}
