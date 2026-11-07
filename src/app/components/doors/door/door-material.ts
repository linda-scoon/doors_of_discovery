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
  /** A curtain hangs in the doorway, stirring in the draught. */
  hasCurtain: boolean;
  /** The hue of that curtain. Deep fabric colours, not door colours. */
  curtainHue: number;
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

function graffitiFor(id: string, ordinal: number): GraffitiTag {
  const spread = (seed: string, from: number, to: number) =>
    Math.round(from + hashToFraction(`${id}:${seed}`) * (to - from));

  const kind = pickWeighted(GRAFFITI_KINDS, `${id}:tagkind`);

  // Stepping round the colour wheel by position rather than hashing it. A
  // hash clumps, so several tags in view came out much the same pink. A
  // stride of 47 degrees is coprime with 360, which puts consecutive tags
  // far apart and uses every hue on the wheel before any repeats.
  const hue = (ordinal * 47) % 360;

  return {
    kind,
    text: kind === 'signature' ? 'Linda' : 'web of doors',
    hue,
    // Offset round the wheel, so a tag looks like one person's two cans
    // rather than two unrelated colours.
    hueAccent: (hue + spread('tagaccent', 110, 250)) % 360,
    shiftX: spread('tagx', -10, 10),
    shiftY: spread('tagy', -14, 14),
    rotate: spread('tagrot', -14, 14),
    scale: 0.8 + hashToFraction(`${id}:tagscale`) * 0.4,
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

  return {
    material,
    design: designForDoor(id, material),
    colour: colourForDoor(id, material),
    handleSide: chance(`${id}:side`, 0.3) ? 'left' : 'right',
    openStyle: openStyleForDoor(id, surprise),
    finish: pick(FINISHES, `${id}:finish`),
    wear: pick(WEARS, `${id}:wear`),
    hasKnocker: chance(`${id}:knocker`, 0.35),
    hasLetterbox: chance(`${id}:letterbox`, 0.4),
    hasKickPlate: chance(`${id}:kickplate`, 0.33),
    hasPeephole: chance(`${id}:peephole`, 0.3),
    hasCurtain: chance(`${id}:curtain`, 0.16),
    curtainHue: Math.round(hashToFraction(`${id}:curtainhue`) * 360),
    hasGraffiti: chance(`${id}:graffiti`, 0.12),
    graffiti: chance(`${id}:graffiti`, 0.12) ? graffitiFor(id, ordinal) : null,
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
