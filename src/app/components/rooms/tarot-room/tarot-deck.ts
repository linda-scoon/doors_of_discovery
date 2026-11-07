/**
 * The 78 cards of the Rider-Waite-Smith tarot, drawn by Pamela Colman Smith
 * and published in 1909, now in the public domain. Each card's picture is
 * the scan on Wikimedia Commons named by `file`.
 *
 * The meanings are the traditional upright ones, cut down to a line.
 */
export interface TarotCard {
  name: string;
  file: string;
  meaning: string;
}

const MAJOR: ReadonlyArray<[string, string]> = [
  ['The Fool', 'A leap into the unknown. Begin, and trust the road.'],
  ['The Magician', 'You already have what you need. Use it.'],
  ['The High Priestess', 'Listen to the quiet part of you. It knows.'],
  ['The Empress', 'Abundance, comfort, things growing.'],
  ['The Emperor', 'Structure, order, and standing your ground.'],
  ['The Hierophant', 'Tradition, teachers, the way things are done.'],
  ['The Lovers', 'A choice made with the heart.'],
  ['The Chariot', 'Willpower. Hold the reins and go.'],
  ['Strength', 'Gentle courage. Patience wins.'],
  ['The Hermit', 'Step back and look inward for a while.'],
  ['Wheel of Fortune', 'Things are turning. Luck is on the move.'],
  ['Justice', 'Fairness, truth, and consequences.'],
  ['The Hanged Man', 'Pause. See it from upside down.'],
  ['Death', 'An ending that makes room for something new.'],
  ['Temperance', 'Balance, moderation, a steady middle path.'],
  ['The Devil', 'Something has a hold on you. Is the chain really locked?'],
  ['The Tower', 'Sudden upheaval. What falls was not built to last.'],
  ['The Star', 'Hope, renewal, calm after the storm.'],
  ['The Moon', 'Not everything is as it seems tonight.'],
  ['The Sun', 'Joy, warmth, success. A good day.'],
  ['Judgement', 'A wake-up call. Time to rise and answer it.'],
  ['The World', 'Completion. A circle closes.'],
];

/** Commons' file names for the major arcana. */
const MAJOR_FILES = [
  'Fool', 'Magician', 'High_Priestess', 'Empress', 'Emperor', 'Hierophant', 'Lovers',
  'Chariot', 'Strength', 'Hermit', 'Wheel_of_Fortune', 'Justice', 'Hanged_Man', 'Death',
  'Temperance', 'Devil', 'Tower', 'Star', 'Moon', 'Sun', 'Judgement', 'World',
];

const RANKS = [
  'Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Page', 'Knight', 'Queen', 'King',
];

/** Each suit: its name, its prefix on Commons, and a meaning per rank. */
const SUITS: ReadonlyArray<[string, string, string[]]> = [
  ['Wands', 'Wands', [
    'A spark of something new.',
    'Plans, and the world laid out before you.',
    'Your ships are coming in.',
    'Celebration, home, a happy gathering.',
    'Squabbles and competition.',
    'Victory, and being cheered for it.',
    'Hold your ground.',
    'Things are moving fast.',
    'Tired, but nearly there.',
    'Carrying too much.',
    'Curious news arrives.',
    'Off on an adventure, in a hurry.',
    'Warmth, confidence, a sunny nature.',
    'A born leader with a vision.',
  ]],
  ['Cups', 'Cups', [
    'Love, overflowing.',
    'A bond between two people.',
    'Friends, and a toast.',
    'Bored with what you have. Look again.',
    'Grieving what was spilled. Two cups still stand.',
    'Sweet memories of childhood.',
    'Daydreams, and too many choices.',
    'Walking away to find something deeper.',
    'A wish granted.',
    'Happiness at home.',
    'A surprise message from the heart.',
    'A romantic offer.',
    'Kindness and intuition.',
    'Calm in the middle of the waves.',
  ]],
  ['Swords', 'Swords', [
    'A breakthrough. The truth cuts clean.',
    'A hard choice, put off.',
    'Heartache.',
    'Rest. Recover.',
    'A hollow victory.',
    'Moving on to calmer water.',
    'Something sneaky is afoot.',
    'Feeling trapped, but the knots are loose.',
    'Worry in the small hours.',
    'Rock bottom. It can only get better.',
    'Watchful, curious, quick-witted.',
    'Charging ahead, all action.',
    'Clear-eyed and honest.',
    'Reason and fairness rule.',
  ]],
  ['Pentacles', 'Pents', [
    'A new opportunity, solid and real.',
    'Juggling, and keeping it all in the air.',
    'Good work, well made.',
    'Holding on tight. Perhaps too tight.',
    'Hard times, out in the cold. Help is close.',
    'Giving and receiving.',
    'Patience. It is still growing.',
    'Practice, and getting better.',
    'Comfort earned.',
    'Family, and what lasts.',
    'A chance to learn something.',
    'Slow, steady, dependable.',
    'Down to earth and generous.',
    'Wealth, and sharing it.',
  ]],
];

export const TAROT_DECK: readonly TarotCard[] = [
  ...MAJOR.map(([name, meaning], i) => ({
    name,
    meaning,
    file: `RWS_Tarot_${String(i).padStart(2, '0')}_${MAJOR_FILES[i]}.jpg`,
  })),
  ...SUITS.flatMap(([suit, prefix, meanings]) =>
    RANKS.map((rank, i) => ({
      name: `${rank} of ${suit}`,
      meaning: meanings[i],
      file: `${prefix}${String(i + 1).padStart(2, '0')}.jpg`,
    }))
  ),
];
