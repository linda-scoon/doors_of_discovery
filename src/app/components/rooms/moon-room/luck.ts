import { Moon, PhaseName, Sign } from './moon';

/**
 * A reading for the day, from the moon's phase and sign: the same for
 * everyone on a given day, a new one tomorrow. Written to be kind -- it is a
 * bit of fun, and nobody should leave a door feeling cursed.
 */

const BY_PHASE: Record<PhaseName, string> = {
  'New moon': 'A clean slate. Start the thing you keep putting off.',
  'Waxing crescent': 'Small steps count today. Plant a seed and water it.',
  'First quarter': 'A little push gets things moving. Make the decision.',
  'Waxing gibbous': 'Nearly there. Polish, practise, and keep going.',
  'Full moon': 'Everything is lit up. Notice what is going well.',
  'Waning gibbous': 'Share what you know. Someone needs to hear it.',
  'Last quarter': 'Let one thing go, and feel lighter for it.',
  'Waning crescent': 'Rest is not lazy. Be gentle with yourself.',
};

const BY_SIGN: Record<Sign, string> = {
  Aries: 'Be bold.',
  Taurus: 'Enjoy something simple and good.',
  Gemini: 'Talk to someone new.',
  Cancer: 'Look after the people close to you.',
  Leo: 'Let yourself shine a little.',
  Virgo: 'Tidy one small corner of your life.',
  Libra: 'Find the balance.',
  Scorpio: 'Trust your instincts.',
  Sagittarius: 'Go somewhere, even just round the block.',
  Capricorn: 'Steady work pays off.',
  Aquarius: 'Try it a different way.',
  Pisces: 'Make room for a daydream.',
};

const COLOURS = ['silver', 'gold', 'blue', 'green', 'violet', 'red', 'white', 'orange'];

/** The same number for everyone, all day. */
function daySeed(date: Date): number {
  let seed = date.getFullYear() * 10_000 + (date.getMonth() + 1) * 100 + date.getDate();
  seed = Math.imul(seed ^ (seed >>> 15), 2246822519);
  seed = Math.imul(seed ^ (seed >>> 13), 3266489917);
  return (seed ^ (seed >>> 16)) >>> 0;
}

export interface Reading {
  message: string;
  /** Out of five, never below two: luck here is only ever fair to good. */
  stars: number;
  number: number;
  colour: string;
}

export function readingFor(moon: Moon, date: Date): Reading {
  const seed = daySeed(date);
  return {
    message: `${BY_PHASE[moon.phase]} ${BY_SIGN[moon.sign]}`,
    stars: 2 + (seed % 4),
    number: 1 + (Math.floor(seed / 4) % 99),
    colour: COLOURS[Math.floor(seed / 400) % COLOURS.length],
  };
}
