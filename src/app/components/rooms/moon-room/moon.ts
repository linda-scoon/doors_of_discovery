/**
 * The moon, worked out from the date -- no API to go down. The sums are the
 * usual short ones, good to well under a degree, which is plenty to say
 * which phase it is in and which sign it is passing through.
 */

const SYNODIC_MONTH = 29.530588853;
/** A new moon: 6 January 2000, 18:14 UTC. */
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);
/** Noon on 1 January 2000, the usual starting point for these sums. */
const J2000 = Date.UTC(2000, 0, 1, 12);
const DAY = 86_400_000;

export const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;
export type Sign = (typeof SIGNS)[number];

export type PhaseName =
  | 'New moon'
  | 'Waxing crescent'
  | 'First quarter'
  | 'Waxing gibbous'
  | 'Full moon'
  | 'Waning gibbous'
  | 'Last quarter'
  | 'Waning crescent';

export interface Moon {
  /** Days since the last new moon, 0 to 29.5. */
  age: number;
  /** How much of the face is lit, 0 to 1. */
  illumination: number;
  waxing: boolean;
  phase: PhaseName;
  sign: Sign;
}

function phaseName(age: number): PhaseName {
  const eighth = SYNODIC_MONTH / 8;
  const names: PhaseName[] = [
    'New moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous',
    'Full moon', 'Waning gibbous', 'Last quarter', 'Waning crescent',
  ];
  // Centred on each named moment, so "full" covers the days either side.
  return names[Math.floor((age + eighth / 2) / eighth) % 8];
}

export function moonOn(date: Date): Moon {
  const age = ((((date.getTime() - KNOWN_NEW_MOON) / DAY) % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  const illumination = (1 - Math.cos((2 * Math.PI * age) / SYNODIC_MONTH)) / 2;

  // Where the moon is along the zodiac: its mean longitude, corrected for
  // its elliptical orbit and the largest pulls of the sun on it. Good to a
  // fraction of a degree, which matters on the nights it is crossing from
  // one sign into the next.
  const d = (date.getTime() - J2000) / DAY;
  const rad = (degrees: number) => (degrees * Math.PI) / 180;
  const L = 218.316 + 13.176396 * d;
  const M = rad(134.963 + 13.064993 * d); // the moon's mean anomaly
  const D = rad(297.85 + 12.190749 * d); // its elongation from the sun
  const S = rad(357.529 + 0.98560028 * d); // the sun's mean anomaly
  const F = rad(93.272 + 13.22935 * d); // its argument of latitude
  const corrected =
    L +
    6.289 * Math.sin(M) +
    1.274 * Math.sin(2 * D - M) +
    0.658 * Math.sin(2 * D) +
    0.214 * Math.sin(2 * M) -
    0.186 * Math.sin(S) -
    0.114 * Math.sin(2 * F);
  const longitude = ((corrected % 360) + 360) % 360;

  return {
    age,
    illumination,
    waxing: age < SYNODIC_MONTH / 2,
    phase: phaseName(age),
    sign: SIGNS[Math.floor(longitude / 30)],
  };
}

/**
 * The lit part of the moon as an SVG path, for a moon of radius r centred
 * on (r, r). Half the disc's edge on the lit side, and the terminator -- an
 * ellipse whose width follows the phase -- back across.
 */
export function litPath(moon: Moon, r: number): string {
  const terminator = r * Math.abs(Math.cos((2 * Math.PI * moon.age) / SYNODIC_MONTH));
  const litOnRight = moon.waxing;
  // Before full the terminator bows away from the lit side; after, towards.
  const gibbous = moon.illumination > 0.5;
  const outer = litOnRight ? 1 : 0;
  const inner = gibbous === litOnRight ? 1 : 0;
  return (
    `M ${r} 0 ` +
    `A ${r} ${r} 0 0 ${outer} ${r} ${2 * r} ` +
    `A ${terminator} ${r} 0 0 ${inner} ${r} 0 Z`
  );
}
