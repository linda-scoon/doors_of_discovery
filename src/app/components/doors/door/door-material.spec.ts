import { characterForDoor, isPlainDesign } from './door-material';

/**
 * Where each piece of furniture sits down the door, as percentages of its
 * height. These mirror door.component.css; if a piece is moved there, the
 * matching entry here has to move with it or a tag can land on top of it.
 */
const FURNITURE: ReadonlyArray<{
  name: string;
  top: number;
  bottom: number;
  isPresent: (door: ReturnType<typeof characterForDoor>) => boolean;
}> = [
  { name: 'the handle', top: 43, bottom: 63, isPresent: () => true },
  { name: 'the number', top: 10, bottom: 18, isPresent: (d) => d.number !== null },
  { name: 'the peephole', top: 16, bottom: 23, isPresent: (d) => d.hasPeephole },
  { name: 'the knocker', top: 25, bottom: 36, isPresent: (d) => d.hasKnocker },
  { name: 'the letterbox', top: 55, bottom: 62, isPresent: (d) => d.hasLetterbox },
  { name: 'the kick plate', top: 81, bottom: 96, isPresent: (d) => d.hasKickPlate },
];

/**
 * How tall a tag is at scale 1, as a share of the door's height. Mirrors
 * the constant in door-material.ts; a tag's real height is TAG_HEIGHT
 * multiplied by its own scale.
 */
const TAG_HEIGHT = 19;

/** The stretch of door a tag covers, top and bottom, as percentages. */
function tagExtent(tag: { shiftY: number; scale: number }) {
  const height = TAG_HEIGHT * tag.scale;
  const centre = 50 + tag.shiftY;
  return { top: centre - height / 2, bottom: centre + height / 2 };
}

/** Every tagged door in a run of ids, which is how the real wall is built. */
function taggedDoors(count: number) {
  return Array.from({ length: count }, (_unused, i) =>
    characterForDoor(`door-${i}`, i)
  ).filter((door) => door.graffiti !== null);
}

describe('door numbers', () => {
  const all = Array.from({ length: 600 }, (_unused, i) =>
    characterForDoor(`door-${i}`, i)
  );

  it('only numbers doors with nothing on the face', () => {
    const wrong = all
      .filter((door) => door.number !== null && !isPlainDesign(door.design))
      .map((door) => `${door.design} door carries number ${door.number}`);

    expect(wrong).toEqual([]);
  });

  it('still numbers enough doors to be worth having', () => {
    const numbered = all.filter((door) => door.number !== null);
    expect(numbered.length).toBeGreaterThan(all.length * 0.08);
  });

  it('always shows a 13, and puts it on a door that can show one', () => {
    const unlucky = all.filter((door) => door.number === 13);

    expect(unlucky.length).toBeGreaterThan(0);
    unlucky.forEach((door) => expect(isPlainDesign(door.design)).toBe(true));
  });

  it('gives every material a plain face to put a number on', () => {
    const plainPerMaterial = new Map<string, number>();
    all.forEach((door) => {
      if (!isPlainDesign(door.design)) return;
      plainPerMaterial.set(
        door.material,
        (plainPerMaterial.get(door.material) ?? 0) + 1
      );
    });

    ['wood', 'metal', 'glass', 'stone'].forEach((material) =>
      expect(plainPerMaterial.get(material), `no plain ${material} door in 600`).toBeGreaterThan(0)
    );
  });
});

describe('graffiti placement', () => {
  const doors = taggedDoors(600);

  it('tags enough doors to be worth testing', () => {
    expect(doors.length).toBeGreaterThan(30);
  });

  it('never puts a tag where the furniture already is', () => {
    const collisions: string[] = [];

    doors.forEach((door, index) => {
      const { top, bottom } = tagExtent(door.graffiti!);

      FURNITURE.filter((piece) => piece.isPresent(door)).forEach((piece) => {
        if (top < piece.bottom && bottom > piece.top) {
          collisions.push(
            `door ${index}: tag at ${top.toFixed(0)}-${bottom.toFixed(0)}% ` +
              `runs into ${piece.name} at ${piece.top}-${piece.bottom}%`
          );
        }
      });
    });

    expect(collisions).toEqual([]);
  });

  it('keeps the whole tag on the door', () => {
    doors.forEach((door) => {
      const { top, bottom } = tagExtent(door.graffiti!);
      expect(top).toBeGreaterThanOrEqual(0);
      expect(bottom).toBeLessThanOrEqual(100);
    });
  });

  it('shrinks a tag rather than running it onto a crowded door', () => {
    // Knocker, letterbox and kick plate between them leave no stretch of
    // door as tall as a full-size tag: the handle takes 41-65%, so the
    // longest clear run on such a door is the 18% above the knocker.
    const crowded = doors.filter(
      (door) => door.hasKnocker && door.hasLetterbox && door.hasKickPlate
    );

    expect(crowded.length).toBeGreaterThan(0);
    crowded.forEach((door) => {
      const { top, bottom } = tagExtent(door.graffiti!);
      expect(bottom - top).toBeLessThanOrEqual(18);
    });
  });

  it('does not drop every tag in the same place', () => {
    const places = new Set(doors.map((door) => door.graffiti!.shiftY));
    expect(places.size).toBeGreaterThan(8);
  });

  it('uses every kind of drip, and uses the plain one most', () => {
    const counts = new Map<string, number>();
    doors.forEach((door) =>
      counts.set(door.graffiti!.drip, (counts.get(door.graffiti!.drip) ?? 0) + 1)
    );

    ['single', 'curtain', 'splash', 'soft'].forEach((style) =>
      expect(counts.get(style), `no door got the ${style} drip`).toBeGreaterThan(0)
    );

    // A splash is only a surprise while most doors are not splashed.
    const single = counts.get('single')!;
    ['curtain', 'splash', 'soft'].forEach((style) =>
      expect(single).toBeGreaterThan(counts.get(style)!)
    );
  });

  it('starts every run on a letter, never on a space or past the words', () => {
    const misplaced: string[] = [];

    doors.forEach((door, index) => {
      door.graffiti!.lines.forEach((line) => {
        // Where the letters are, by the same reckoning the door uses: each
        // character an equal share of the line, spaces skipped.
        const onALetter = new Set(
          [...line.text]
            .map((character, i) =>
              character === ' '
                ? null
                : Math.round(((i + 0.5) / line.text.length) * 100)
            )
            .filter((stop): stop is number => stop !== null)
        );

        line.runs.forEach((run) => {
          if (!onALetter.has(run.x)) {
            misplaced.push(
              `door ${index}: a run at ${run.x}% across "${line.text}" ` +
                `is not on a letter`
            );
          }
        });
      });
    });

    expect(misplaced).toEqual([]);
  });

  it('runs paint off the top line as well as the bottom one', () => {
    const fromTheTop = doors.filter(
      (door) => door.graffiti!.lines.length > 1 && door.graffiti!.lines[0].runs.length
    );

    expect(fromTheTop.length, 'every run came off the last line').toBeGreaterThan(0);
  });

  it('runs paint from an upper line far enough to pass the line below', () => {
    doors.forEach((door) => {
      const lines = door.graffiti!.lines;

      lines.forEach((line, index) => {
        const below = lines.length - 1 - index;
        line.runs.forEach((run) => {
          // A run that stopped between the two lines would look like a
          // smudge rather than paint that ran.
          expect(run.length).toBeGreaterThanOrEqual(10 + below * 16);
        });
      });
    });
  });

  it('gives each kind of drip the right number of runs', () => {
    doors.forEach((door) => {
      const { drip, lines } = door.graffiti!;
      const runs = lines.reduce((total, line) => total + line.runs.length, 0);

      // A drawing has no letters, so nothing can run off it.
      if (!lines.length) {
        expect(runs).toBe(0);
        return;
      }

      if (drip === 'splash') expect(runs).toBe(0);
      else if (drip === 'curtain') expect(runs).toBeGreaterThanOrEqual(5);
      else expect(runs).toBe(1);
    });
  });

  it('only splashes the doors that were splashed', () => {
    doors.forEach((door) => {
      const { drip, specks } = door.graffiti!;
      if (drip === 'splash') expect(specks.length).toBeGreaterThanOrEqual(11);
      else expect(specks).toEqual([]);
    });
  });

  it('never flings a speck off the side of the door', () => {
    doors.forEach((door) => {
      door.graffiti!.specks.forEach((speck) => {
        expect(speck.x).toBeGreaterThanOrEqual(0);
        expect(speck.x).toBeLessThanOrEqual(100);
        // Paint runs off the bottom and is clipped there, which is what it
        // would really do, but it never starts below the door.
        expect(speck.y).toBeGreaterThanOrEqual(0);
        expect(speck.y).toBeLessThanOrEqual(100);
      });
    });
  });

  it('writes tags in more than one hand', () => {
    const hands = new Set(doors.map((door) => door.graffiti!.font));
    expect(hands.size).toBeGreaterThan(4);
  });

  it('writes a signature in a script and a tag in a marker', () => {
    const scripts = ["'Dancing Script'", "'Caveat'", "'Nanum Pen Script'",
      "'Reenie Beanie'", "'Just Another Hand'"];

    doors.forEach((door) => {
      const { kind, font } = door.graffiti!;
      if (kind === 'signature') expect(scripts).toContain(font);
      else expect(scripts).not.toContain(font);
    });
  });

  it('gives the same door the same tag every time', () => {
    const once = characterForDoor('door-42', 42).graffiti;
    const again = characterForDoor('door-42', 42).graffiti;
    expect(again).toEqual(once);
  });
});
