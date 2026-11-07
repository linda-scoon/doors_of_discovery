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

/** One run of paint, or one speck of a splash. */
export interface PaintMark {
  /** Across the door, as a percentage of its width. */
  x: number;
  /** Down the door, as a percentage of its height. */
  y: number;
  /** How thick the run or speck is, in pixels. */
  thickness: number;
  /** How far it runs down the door, as a percentage of its height. */
  length: number;
  /** A flung speck, drawn as a blob, rather than a run drawn as a line. */
  round: boolean;
}

export interface GraffitiTag {
  /** Whether this one is a tag, a signature, or a drawing. */
  kind: GraffitiKind;
  /** The words sprayed, for a tag. Empty for a drawing. */
  text: string;
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
  /** Every run or speck of it, placed against the door. */
  marks: PaintMark[];
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
    text: kind === 'signature' ? 'Linda' : 'web of doors',
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
    marks: paintMarks(id, drip, placement),
  };
}

/**
 * Where the paint ran, and how far.
 *
 * Marks are placed against the door rather than against the lettering, so
 * that a run starts under the words and carries on down the timber. They
 * are clipped at the foot of the door like everything else, which is what
 * a run that reached the bottom would do anyway.
 */
function paintMarks(
  id: string,
  drip: DripStyle,
  placement: { shiftY: number; scale: number }
): PaintMark[] {
  const tagBottom = 50 + placement.shiftY + (TAG_HEIGHT * placement.scale) / 2;

  // Each mark gets its own seeds, so changing how many there are does not
  // move the ones that were already there.
  const of = (index: number, part: string) =>
    hashToFraction(`${id}:mark${index}:${part}`);

  const tagMiddle = 50 + placement.shiftY;

  if (drip === 'splash') {
    // Paint thrown at the door rather than sprayed on it, so the specks
    // scatter round the lettering instead of hanging below it. They are
    // placed by angle and distance rather than in a box, which is what
    // makes it read as one splash rather than as scattered dirt.
    const count = 11 + Math.floor(hashToFraction(`${id}:splash`) * 6);

    return Array.from({ length: count }, (_unused, i) => {
      const angle = of(i, 'angle') * Math.PI * 2;
      // Not square-rooted on purpose: that would spread them evenly over
      // the circle, and a splash is thickest where it hit.
      const distance = of(i, 'dist');

      // Most specks are small and a few are big, rather than all middling.
      const size = of(i, 'size') ** 2;

      return {
        x: Math.round(50 + Math.cos(angle) * distance * 34),
        y: Math.round(tagMiddle + Math.sin(angle) * distance * 15),
        thickness: Math.round(2 + size * 10),
        // The heaviest few ran a little before they dried.
        length: size > 0.55 ? Math.round(3 + of(i, 'tail') * 7) : 0,
        round: size <= 0.55,
      };
    });
  }

  if (drip === 'curtain') {
    // The can held still too long: a row of runs, each a different length,
    // which is what stops it reading as a comb.
    const count = 5 + Math.floor(hashToFraction(`${id}:curtain`) * 4);

    return Array.from({ length: count }, (_unused, i) => ({
      // Spread across the lettering rather than placed at random, or they
      // bunch up and leave half the tag dry.
      x: Math.round(24 + (i / Math.max(1, count - 1)) * 52 + of(i, 'x') * 5),
      // Started off whichever letter they came from, so the tops of the
      // runs are not all on one line.
      y: Math.round(tagBottom - 5 + of(i, 'y') * 4),
      thickness: Math.round(2 + of(i, 'thick') * 2),
      length: Math.round(7 + of(i, 'len') * 26),
      round: false,
    }));
  }

  // One run, from somewhere under the middle of the lettering.
  return [
    {
      x: Math.round(38 + hashToFraction(`${id}:dripx`) * 26),
      y: Math.round(tagBottom - 4),
      thickness: 3,
      length: Math.round(14 + hashToFraction(`${id}:driplen`) * 20),
      round: false,
    },
  ];
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

  // A 13 always shows its number. Left to chance it would be hidden more
  // often than not, and a superstition nobody can see is not worth having.
  const number = isUnlucky
    ? UNLUCKY_NUMBER
    : chance(`${id}:plate`, 0.45)
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
    design: designForDoor(id, material),
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
