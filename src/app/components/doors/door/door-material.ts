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
 * Nothing on a door is a letter, numeral or symbol, and nothing should be.
 * Marks acquire meanings their author never intended — a diagonal brace
 * reads as a Z, and two-digit house numbers include several that are known
 * extremist codes. With doors generated endlessly and nobody reviewing each
 * one, the only safe rule is that doors carry hardware, not characters.
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
export type Surprise = 'none' | 'crack' | 'fire' | 'monster' | 'knocks-back';

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

const OPEN_STYLE_WEIGHTS: ReadonlyArray<[OpenStyle, number]> = [
  ['swing', 68],
  ['creak', 24],
  ['stuck', 8],
];

const SURPRISE_WEIGHTS: ReadonlyArray<[Surprise, number]> = [
  ['none', 74],
  ['crack', 9],
  ['fire', 7],
  ['monster', 6],
  ['knocks-back', 4],
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
  if (surprise === 'fire' || surprise === 'monster') {
    return pickWeighted([['swing', 70], ['creak', 30]], `${id}:open`);
  }
  return pickWeighted(OPEN_STYLE_WEIGHTS, `${id}:open`);
}

/**
 * How many doors stand between the visitor and the room. Usually one; now
 * and then you open a door and find another behind it.
 */
export function doorLayersFor(id: string): number {
  const roll = hashToFraction(`${id}:layers`);
  if (roll > 0.9) return 3;
  if (roll > 0.74) return 2;
  return 1;
}

/** Everything about one door, in one go. */
export function characterForDoor(id: string): DoorCharacter {
  const material = materialForDoor(id);
  const surprise = pickWeighted(SURPRISE_WEIGHTS, `${id}:surprise`);

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
