/** Which part of the sky a body belongs to. The arrows move within one. */
export type Group = 'The Sun and planets' | 'Moons' | 'Dwarf planets, asteroids and comets' | 'Deep space' | 'Home, seen from space';

/** One thing in the sky, with a photograph of it and what to know. */
export interface Body {
  name: string;
  group: Group;
  /** What it is. Left out for a planet, which is described by its place from the Sun. */
  kind?: string;
  /** The photograph's file name on Wikimedia Commons, which is also where it is credited in full. */
  file: string;
  /** Who took or made the photograph, as its page on Commons gives it. */
  credit: string;
  /** Drawn behind the photograph while it loads, and in its place if it cannot. */
  colour: string;
  facts: ReadonlyArray<readonly [string, string]>;
  fact: string;
}

const NASA = 'NASA';

/**
 * Photographs from space missions and telescopes -- most from NASA, ESA and
 * Webb, a few from astronomers on the ground -- with figures from NASA's
 * fact sheets. Moon counts are given as "more than" where new ones are
 * still being found.
 */
export const BODIES: readonly Body[] = [
  // ------------------------------------------------- the Sun and planets
  {
    name: 'The Sun', group: 'The Sun and planets', kind: 'Our star',
    file: "The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA's_Solar_Dynamics_Observatory_-_20100819.jpg",
    credit: 'NASA/SDO (AIA)', colour: '#f9a825',
    facts: [['Distance', '150 million km from Earth'], ['A day', 'about 27 Earth days at its middle'], ['A year', '230 million years to go once round the galaxy'], ['Moons', 'eight planets instead']],
    fact: 'About 1.3 million Earths would fit inside it, and its light takes eight minutes to reach us.',
  },
  {
    name: 'Mercury', group: 'The Sun and planets', file: 'Mercury_in_true_color.jpg',
    credit: 'NASA/Johns Hopkins APL/Carnegie Institution of Washington', colour: '#9e9e9e',
    facts: [['Distance', '58 million km from the Sun'], ['A day', '176 Earth days, sunrise to sunrise'], ['A year', '88 Earth days'], ['Moons', 'none']],
    fact: 'The smallest planet. Its days reach 430°C and its nights fall to -180°C.',
  },
  {
    name: 'Venus', group: 'The Sun and planets', file: 'Venus-real_color.jpg',
    credit: NASA, colour: '#e0c27a',
    facts: [['Distance', '108 million km from the Sun'], ['A day', '117 Earth days, sunrise to sunrise'], ['A year', '225 Earth days'], ['Moons', 'none']],
    fact: 'The hottest planet, at 465°C, and it spins backwards: there the Sun rises in the west.',
  },
  {
    name: 'Earth', group: 'The Sun and planets', file: 'The_Earth_seen_from_Apollo_17.jpg',
    credit: 'NASA/Apollo 17 crew', colour: '#3d7cc9',
    facts: [['Distance', '150 million km from the Sun'], ['A day', '24 hours'], ['A year', '365¼ days'], ['Moons', 'one']],
    fact: 'The only place we know of with life. This photograph was taken by the crew of Apollo 17 in 1972.',
  },
  {
    name: 'Mars', group: 'The Sun and planets', file: 'OSIRIS_Mars_true_color.jpg',
    credit: 'ESA & MPS for OSIRIS Team, CC BY-SA 3.0 IGO', colour: '#c1440e',
    facts: [['Distance', '228 million km from the Sun'], ['A day', '24 hours 40 minutes'], ['A year', '687 Earth days'], ['Moons', 'two, Phobos and Deimos']],
    fact: 'Home to Olympus Mons, a volcano about two and a half times as tall as Mount Everest.',
  },
  {
    name: 'Jupiter', group: 'The Sun and planets', file: 'Jupiter_and_its_shrunken_Great_Red_Spot.jpg',
    credit: 'NASA, ESA, and A. Simon (GSFC)', colour: '#c99e6f',
    facts: [['Distance', '778 million km from the Sun'], ['A day', 'just under 10 hours'], ['A year', '12 Earth years'], ['Moons', 'more than 90']],
    fact: 'The biggest planet. Its Great Red Spot is a storm wider than the whole Earth.',
  },
  {
    name: 'Saturn', group: 'The Sun and planets', file: 'Saturn_during_Equinox.jpg',
    credit: 'NASA/JPL/Space Science Institute', colour: '#d8c08a',
    facts: [['Distance', '1.4 billion km from the Sun'], ['A day', '10½ hours'], ['A year', '29 Earth years'], ['Moons', 'more than any other planet']],
    fact: 'Its rings are mostly ice, and it is so light for its size that it would float in water.',
  },
  {
    name: 'Uranus', group: 'The Sun and planets', file: 'Uranus2.jpg',
    credit: 'NASA/JPL-Caltech', colour: '#9fd8e0',
    facts: [['Distance', '2.9 billion km from the Sun'], ['A day', '17 hours'], ['A year', '84 Earth years'], ['Moons', 'more than 25']],
    fact: 'It spins on its side, so each pole has 42 years of sunshine and then 42 years of dark.',
  },
  {
    name: 'Neptune', group: 'The Sun and planets', file: 'Neptune_-_Voyager_2_(29347980845)_flatten_crop.jpg',
    credit: 'NASA/JPL/Voyager-ISS/Aster Cowart', colour: '#3f63c9',
    facts: [['Distance', '4.5 billion km from the Sun'], ['A day', '16 hours'], ['A year', '165 Earth years'], ['Moons', 'more than 15']],
    fact: 'The windiest planet: its storms blow at more than 2,000 km an hour.',
  },
  {
    name: 'Pluto', group: 'The Sun and planets', kind: 'A dwarf planet', file: 'Pluto_in_True_Color_-_High-Res.jpg',
    credit: 'NASA/JHUAPL/SwRI/Alex Parker', colour: '#d7b99a',
    facts: [['Distance', '5.9 billion km from the Sun'], ['A day', '6½ Earth days'], ['A year', '248 Earth years'], ['Moons', 'five']],
    fact: 'It has a huge heart-shaped plain of ice, first seen when New Horizons flew past in 2015.',
  },

  // ---------------------------------------------------------------- moons
  {
    name: 'The Moon', group: 'Moons', kind: "Earth's moon", file: 'FullMoon2010.jpg',
    credit: 'Gregory H. Revera, CC BY-SA 3.0', colour: '#bdbdbd',
    facts: [['Distance', '384,400 km from Earth'], ['Width', '3,475 km, about a quarter of Earth'], ['A day', '29½ Earth days']],
    fact: 'Twelve people walked on it between 1969 and 1972. It always shows Earth the same face.',
  },
  {
    name: 'Io', group: 'Moons', kind: 'A moon of Jupiter', file: 'Io_highest_resolution_natural_color.png',
    credit: NASA, colour: '#e3c95b',
    facts: [['Width', '3,640 km'], ['Goes round Jupiter in', '1¾ days']],
    fact: 'The most volcanic place in the solar system, with hundreds of volcanoes erupting.',
  },
  {
    name: 'Europa', group: 'Moons', kind: 'A moon of Jupiter', file: 'Europa_-_Perijove_45_(cropped).png',
    credit: 'NASA/JPL-Caltech/SwRI/MSSS/Kevin M. Gill, CC BY 2.0', colour: '#cdbfa5',
    facts: [['Width', '3,120 km'], ['Goes round Jupiter in', '3½ days']],
    fact: "Under its shell of ice is an ocean holding more water than all of Earth's oceans.",
  },
  {
    name: 'Ganymede', group: 'Moons', kind: 'A moon of Jupiter', file: 'Ganymede_-_Perijove_34_Composite.png',
    credit: 'NASA/JPL-Caltech/SwRI/MSSS/Kevin M. Gill, CC BY 2.0', colour: '#9b8f80',
    facts: [['Width', '5,270 km'], ['Goes round Jupiter in', '7 days']],
    fact: 'The biggest moon in the solar system: larger than the planet Mercury.',
  },
  {
    name: 'Callisto', group: 'Moons', kind: 'A moon of Jupiter', file: 'Callisto_VGR2_C2060635_OGB.png',
    credit: 'NASA/Voyager 2, processed by zelario12, CC BY-SA 2.0', colour: '#6f6458',
    facts: [['Width', '4,820 km'], ['Goes round Jupiter in', '16½ days']],
    fact: 'One of the most cratered places known; its face has hardly changed in four billion years.',
  },
  {
    name: 'Titan', group: 'Moons', kind: 'A moon of Saturn', file: 'Titan_in_true_color_by_Kevin_M._Gill.jpg',
    credit: 'NASA/JPL-Caltech/SSI/Kevin M. Gill, CC BY 2.0', colour: '#d9a441',
    facts: [['Width', '5,150 km'], ['Goes round Saturn in', '16 days']],
    fact: 'The only moon with a thick atmosphere, and it has lakes and rivers of liquid methane.',
  },
  {
    name: 'Enceladus', group: 'Moons', kind: 'A moon of Saturn', file: 'PIA17202_-_Approaching_Enceladus.jpg',
    credit: 'NASA/JPL', colour: '#e6eef2',
    facts: [['Width', '504 km'], ['Goes round Saturn in', '33 hours']],
    fact: "Fountains of ice shoot out of cracks at its south pole, and feed one of Saturn's rings.",
  },
  {
    name: 'Mimas', group: 'Moons', kind: 'A moon of Saturn', file: 'Mimas_Masked.jpg',
    credit: 'NASA/JPL/Space Science Institute', colour: '#bdbdbd',
    facts: [['Width', '396 km'], ['Goes round Saturn in', '22½ hours']],
    fact: 'Its giant crater, Herschel, is almost a third as wide as the whole moon.',
  },
  {
    name: 'Triton', group: 'Moons', kind: 'A moon of Neptune', file: 'Triton-usgs23-with-frame.jpg',
    credit: 'Michael T. Bland, USGS, CC BY 4.0', colour: '#d8c7c0',
    facts: [['Width', '2,710 km'], ['Goes round Neptune in', '6 days']],
    fact: "It goes round Neptune backwards, against the planet's spin, and has geysers of nitrogen.",
  },
  {
    name: 'Phobos', group: 'Moons', kind: 'A moon of Mars', file: 'Phobos_colour_2008.jpg',
    credit: 'NASA/JPL-Caltech/University of Arizona', colour: '#7a6a5c',
    facts: [['Width', 'about 22 km'], ['Goes round Mars in', '7½ hours']],
    fact: 'It is slowly spiralling in towards Mars, and in about 50 million years will break up or crash.',
  },
  {
    name: 'Charon', group: 'Moons', kind: 'A moon of Pluto', file: 'Charon_in_True_Color_-_High-Res.png',
    credit: 'NASA/JHUAPL/SwRI/Alex Parker', colour: '#a99c92',
    facts: [['Width', '1,212 km'], ['Goes round Pluto in', '6½ days']],
    fact: 'It is half the size of Pluto, so the two circle each other, always face to face.',
  },

  // ----------------------------------------- dwarf planets, asteroids and comets
  {
    name: 'Ceres', group: 'Dwarf planets, asteroids and comets', kind: 'A dwarf planet',
    file: 'Ceres_-_RC3_-_Haulani_Crater_(22381131691)_(cropped).jpg',
    credit: 'NASA/JPL-Caltech/UCLA/MPS/DLR/IDA, processed by Justin Cowart', colour: '#8d8a86',
    facts: [['Where', 'in the asteroid belt, between Mars and Jupiter'], ['Width', '940 km'], ['A year', '4.6 Earth years']],
    fact: 'The biggest thing in the asteroid belt. Its bright spots are salt, left by salty water.',
  },
  {
    name: 'Vesta', group: 'Dwarf planets, asteroids and comets', kind: 'An asteroid', file: 'Vesta_in_natural_color.jpg',
    credit: 'NASA/JPL/MPS/DLR/IDA/Björn Jónsson', colour: '#9a9187',
    facts: [['Where', 'in the asteroid belt'], ['Width', '525 km'], ['A year', '3.6 Earth years']],
    fact: 'Now and then bright enough to see without a telescope, and pieces of it have landed on Earth.',
  },
  {
    name: 'Bennu', group: 'Dwarf planets, asteroids and comets', kind: 'An asteroid', file: 'Bennu_mosaic_OSIRIS-REx_(square).png',
    credit: 'NASA/Goddard/University of Arizona', colour: '#6b6b6b',
    facts: [['Width', 'about 490 metres'], ['A year', '1.2 Earth years']],
    fact: 'A spacecraft scooped up a handful of it in 2020 and brought it back to Earth in 2023.',
  },
  {
    name: 'Comet 67P', group: 'Dwarf planets, asteroids and comets', kind: 'A comet', file: 'Comet_67P_True_color.jpg',
    credit: 'ESA/Rosetta/MPS for OSIRIS Team, CC BY-SA 4.0', colour: '#6b6b6b',
    facts: [['Width', 'about 4 km'], ['A year', '6½ Earth years']],
    fact: 'In 2014 the lander Philae touched down on it: the first landing ever on a comet.',
  },
  {
    name: "Halley's Comet", group: 'Dwarf planets, asteroids and comets', kind: 'A comet', file: 'Lspn_comet_halley.jpg',
    credit: 'NASA/W. Liller', colour: '#3c4a6b',
    facts: [['Comes back', 'every 75 or 76 years'], ['Next due', '2061']],
    fact: 'People have watched it come and go for over 2,000 years. This is its last visit, in 1986.',
  },
  {
    name: 'Arrokoth', group: 'Dwarf planets, asteroids and comets', kind: 'A Kuiper belt object',
    file: 'Reworked_composite_image_of_Arrokoth.png',
    credit: 'NASA/JHUAPL/SwRI/Roman Tkachenko', colour: '#8a5a44',
    facts: [['Distance', '6.6 billion km from the Sun'], ['Length', '36 km']],
    fact: 'The farthest thing a spacecraft has ever visited: New Horizons flew past it in 2019.',
  },

  // ------------------------------------------------------------ deep space
  {
    name: 'The Pillars of Creation', group: 'Deep space', kind: 'In the Eagle Nebula', file: 'Eagle_nebula_pillars.jpg',
    credit: 'NASA, Jeff Hester and Paul Scowen (ASU)', colour: '#6b8f5c',
    facts: [['Distance', '6,500 light years'], ['Tallest pillar', 'about 4 light years high']],
    fact: 'Towers of gas and dust where new stars are being born.',
  },
  {
    name: 'The Crab Nebula', group: 'Deep space', kind: 'What is left of an exploded star', file: 'Crab_Nebula.jpg',
    credit: 'NASA, ESA, J. Hester and A. Loll (ASU)', colour: '#c46a3a',
    facts: [['Distance', '6,500 light years']],
    fact: 'People on Earth saw the star explode in 1054. It was bright enough to see by day for weeks.',
  },
  {
    name: 'The Horsehead Nebula', group: 'Deep space', kind: 'A dark cloud in Orion', file: 'Nebulosa_testa_di_cavallo_con_SPECULOOS.jpg',
    credit: 'ESO, CC BY 4.0', colour: '#a8433e',
    facts: [['Distance', 'about 1,400 light years']],
    fact: "A cloud of dark dust in the shape of a horse's head, standing in front of glowing gas.",
  },
  {
    name: 'The Orion Nebula', group: 'Deep space', kind: 'A star nursery', file: 'Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg',
    credit: 'NASA, ESA, M. Robberto (STScI/ESA)', colour: '#b0607a',
    facts: [['Distance', '1,350 light years']],
    fact: "The nearest big star nursery to us. You can see it with your own eyes in Orion's sword.",
  },
  {
    name: 'The Lagoon Nebula', group: 'Deep space', kind: 'A star nursery in Sagittarius', file: 'VST_images_the_Lagoon_Nebula.jpg',
    credit: 'ESO/VPHAS+ team, CC BY 4.0', colour: '#c0506b',
    facts: [['Distance', 'about 4,000 light years']],
    fact: 'Bright enough to find with a pair of binoculars on a clear summer night.',
  },
  {
    name: 'The Tarantula Nebula', group: 'Deep space', kind: 'In a small galaxy next to ours',
    file: 'Tarantula_Nebula_by_JWST.jpg', credit: 'NASA, ESA, CSA, STScI, Webb ERO Production Team', colour: '#5b7fb5',
    facts: [['Distance', '161,000 light years']],
    fact: 'The biggest, brightest place where stars are being born in our whole neighbourhood of galaxies.',
  },
  {
    name: 'The Ring Nebula', group: 'Deep space', kind: 'A dying star', file: 'Webb_captures_detailed_beauty_of_Ring_Nebula_(NIRCam_image)_(weic2320b).jpg',
    credit: 'ESA/Webb, NASA, CSA, M. Barlow, N. Cox, R. Wesson, CC BY 4.0', colour: '#c47a3a',
    facts: [['Distance', 'about 2,500 light years']],
    fact: "A dying star's outer layers, blown away into a glowing ring.",
  },
  {
    name: 'The Southern Ring Nebula', group: 'Deep space', kind: 'A dying star', file: 'Southern_Ring_Nebula_(NIRCam_Image).png',
    credit: 'NASA, ESA, CSA, STScI', colour: '#4f8fb5',
    facts: [['Distance', 'about 2,500 light years']],
    fact: 'One of the first pictures from the Webb telescope, in 2022.',
  },
  {
    name: 'The Helix Nebula', group: 'Deep space', kind: 'A dying star', file: 'NGC7293_(2004).jpg',
    credit: "NASA, ESA, C.R. O'Dell, M. Meixner and P. McCullough", colour: '#3f8f8f',
    facts: [['Distance', '650 light years']],
    fact: 'Billions of years from now, our own Sun will end its life making something like this.',
  },
  {
    name: "The Cat's Eye Nebula", group: 'Deep space', kind: 'A dying star', file: 'Looking_at_the_Cat’s_Eye_Nebula_with_Hubble_(potm2602b).jpg',
    credit: 'ESA/Hubble & NASA, Z. Tsvetanov, CC BY 4.0', colour: '#5fa08a',
    facts: [['Distance', 'about 3,300 light years']],
    fact: 'Shells of gas puffed out, one after another, by a star near the end of its life.',
  },
  {
    name: 'The Andromeda Galaxy', group: 'Deep space', kind: 'Our nearest big galaxy', file: 'M31-Andromede-16-09-2023-Hamois.jpg',
    credit: 'Luc Viatour, CC BY-SA 2.5', colour: '#8f8fb5',
    facts: [['Distance', '2.5 million light years'], ['Stars', 'about a trillion']],
    fact: 'The farthest thing you can see with your own eyes, as a faint smudge on a dark night.',
  },
  {
    name: 'The Whirlpool Galaxy', group: 'Deep space', kind: 'A spiral galaxy', file: 'Messier51_sRGB.jpg',
    credit: 'NASA and ESA', colour: '#7f8fb5',
    facts: [['Distance', 'about 30 million light years']],
    fact: 'A spiral galaxy tugging at a smaller one, which you can see at the end of one of its arms.',
  },
  {
    name: 'The Sombrero Galaxy', group: 'Deep space', kind: 'A spiral galaxy, seen edge on', file: 'Sombrero_Galaxy_(heic2506a).jpg',
    credit: 'ESA/Hubble & NASA, K. Noll, CC BY 4.0', colour: '#b5a07f',
    facts: [['Distance', 'about 30 million light years']],
    fact: 'Named for its wide brim of dust, which makes it look like a Mexican hat.',
  },
  {
    name: 'The Cartwheel Galaxy', group: 'Deep space', kind: 'A ring galaxy', file: 'Cartwheel_Galaxy.jpg',
    credit: 'ESA/Hubble & NASA', colour: '#7f9fc5',
    facts: [['Distance', '500 million light years']],
    fact: 'Its ring formed when a smaller galaxy crashed straight through the middle of it.',
  },
  {
    name: "Stephan's Quintet", group: 'Deep space', kind: 'A group of galaxies', file: "Stephan's_Quintet_Hubble_2009.full_denoise.jpg",
    credit: 'NASA, ESA, and the Hubble SM4 ERO Team', colour: '#b59f7f',
    facts: [['Distance', 'about 290 million light years']],
    fact: 'Five galaxies that look close together. Four really are, and are slowly pulling each other apart.',
  },
  {
    name: 'The Hubble Ultra Deep Field', group: 'Deep space', kind: 'Looking back in time', file: 'Hubble_ultra_deep_field_high_rez_edit1.jpg',
    credit: 'NASA and ESA', colour: '#2b2f4a',
    facts: [['Oldest light in it', 'about 13 billion years']],
    fact: 'Hubble stared at one tiny dark patch of sky for eleven days. Almost every speck is a galaxy.',
  },
  {
    name: "Webb's First Deep Field", group: 'Deep space', kind: 'Looking back in time', file: "Webb's_First_Deep_Field.jpg",
    credit: 'NASA, ESA, CSA, and STScI', colour: '#4a3f2b',
    facts: [['Oldest light in it', 'over 13 billion years']],
    fact: "Thousands of galaxies in a patch of sky the size of a grain of sand held at arm's length.",
  },

  // ------------------------------------------------- home, seen from space
  {
    name: 'Earthrise', group: 'Home, seen from space', kind: 'Earth from the Moon, 1968', file: 'NASA-Apollo8-Dec24-Earthrise.jpg',
    credit: 'NASA/Bill Anders', colour: '#3d7cc9',
    facts: [['Taken by', 'Bill Anders, on Apollo 8']],
    fact: 'The first time anyone saw the Earth rise over the Moon, on Christmas Eve 1968.',
  },
  {
    name: 'The Pale Blue Dot', group: 'Home, seen from space', kind: 'Earth from 6 billion km away', file: 'Pale_Blue_Dot.png',
    credit: 'NASA/JPL (Voyager 1)', colour: '#2b2f4a',
    facts: [['Taken by', 'Voyager 1, in 1990']],
    fact: 'Voyager 1 turned round to photograph home. Earth is the tiny speck in the band of light.',
  },
];
