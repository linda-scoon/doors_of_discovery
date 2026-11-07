/** One body in the solar system, with a photograph of it and what to know. */
export interface Planet {
  name: string;
  /** What kind of thing it is, when it is not simply a planet. */
  kind?: string;
  /** The file's name on Wikimedia Commons. */
  file: string;
  /** Drawn behind the photograph while it loads, and in its place if it cannot. */
  colour: string;
  distance: string;
  day: string;
  year: string;
  moons: string;
  fact: string;
}

/**
 * The Sun, the eight planets and Pluto, in order outward. Photographs from
 * NASA's missions, which are free for anyone to use; figures from NASA's
 * planetary fact sheets. Moon counts are given as "more than" where new
 * ones are still being found.
 */
export const PLANETS: readonly Planet[] = [
  {
    name: 'The Sun',
    kind: 'Our star',
    file: "The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA's_Solar_Dynamics_Observatory_-_20100819.jpg",
    colour: '#f9a825',
    distance: '150 million km from Earth',
    day: 'about 27 Earth days at its middle',
    year: '230 million years to go once round the galaxy',
    moons: 'eight planets instead',
    fact: 'About 1.3 million Earths would fit inside it, and its light takes eight minutes to reach us.',
  },
  {
    name: 'Mercury',
    file: 'Mercury_in_true_color.jpg',
    colour: '#9e9e9e',
    distance: '58 million km from the Sun',
    day: '176 Earth days, sunrise to sunrise',
    year: '88 Earth days',
    moons: 'none',
    fact: 'The smallest planet. Its days reach 430°C and its nights fall to -180°C.',
  },
  {
    name: 'Venus',
    file: 'Venus-real_color.jpg',
    colour: '#e0c27a',
    distance: '108 million km from the Sun',
    day: '117 Earth days, sunrise to sunrise',
    year: '225 Earth days',
    moons: 'none',
    fact: 'The hottest planet, at 465°C, and it spins backwards: there the Sun rises in the west.',
  },
  {
    name: 'Earth',
    file: 'The_Earth_seen_from_Apollo_17.jpg',
    colour: '#3d7cc9',
    distance: '150 million km from the Sun',
    day: '24 hours',
    year: '365¼ days',
    moons: 'one',
    fact: 'The only place we know of with life. This photograph was taken by the crew of Apollo 17 in 1972.',
  },
  {
    name: 'Mars',
    file: 'OSIRIS_Mars_true_color.jpg',
    colour: '#c1440e',
    distance: '228 million km from the Sun',
    day: '24 hours 40 minutes',
    year: '687 Earth days',
    moons: 'two, Phobos and Deimos',
    fact: 'Home to Olympus Mons, a volcano about two and a half times as tall as Mount Everest.',
  },
  {
    name: 'Jupiter',
    file: 'Jupiter_and_its_shrunken_Great_Red_Spot.jpg',
    colour: '#c99e6f',
    distance: '778 million km from the Sun',
    day: 'just under 10 hours',
    year: '12 Earth years',
    moons: 'more than 90',
    fact: 'The biggest planet. Its Great Red Spot is a storm wider than the whole Earth.',
  },
  {
    name: 'Saturn',
    file: 'Saturn_during_Equinox.jpg',
    colour: '#d8c08a',
    distance: '1.4 billion km from the Sun',
    day: '10½ hours',
    year: '29 Earth years',
    moons: 'more than any other planet',
    fact: 'Its rings are mostly ice, and it is so light for its size that it would float in water.',
  },
  {
    name: 'Uranus',
    file: 'Uranus2.jpg',
    colour: '#9fd8e0',
    distance: '2.9 billion km from the Sun',
    day: '17 hours',
    year: '84 Earth years',
    moons: 'more than 25',
    fact: 'It spins on its side, so each pole has 42 years of sunshine and then 42 years of dark.',
  },
  {
    name: 'Neptune',
    file: 'Neptune_-_Voyager_2_(29347980845)_flatten_crop.jpg',
    colour: '#3f63c9',
    distance: '4.5 billion km from the Sun',
    day: '16 hours',
    year: '165 Earth years',
    moons: 'more than 15',
    fact: 'The windiest planet: its storms blow at more than 2,000 km an hour.',
  },
  {
    name: 'Pluto',
    kind: 'A dwarf planet',
    file: 'Pluto_in_True_Color_-_High-Res.jpg',
    colour: '#d7b99a',
    distance: '5.9 billion km from the Sun',
    day: '6½ Earth days',
    year: '248 Earth years',
    moons: 'five',
    fact: 'It has a huge heart-shaped plain of ice, first seen when New Horizons flew past in 2015.',
  },
];
