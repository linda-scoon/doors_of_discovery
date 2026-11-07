import { characterForDoor } from './door-material';

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
    // A door carrying everything has no gap a full-size tag fits in.
    const crowded = doors.filter(
      (door) =>
        door.hasKnocker &&
        door.hasLetterbox &&
        door.hasKickPlate &&
        door.number !== null
    );

    expect(crowded.length).toBeGreaterThan(0);
    crowded.forEach((door) => expect(door.graffiti!.scale).toBeLessThan(0.78));
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
      expect(counts.get(style))
        .withContext(`no door got the ${style} drip`)
        .toBeGreaterThan(0)
    );

    // A splash is only a surprise while most doors are not splashed.
    const single = counts.get('single')!;
    ['curtain', 'splash', 'soft'].forEach((style) =>
      expect(single).toBeGreaterThan(counts.get(style)!)
    );
  });

  it('gives each kind of drip the right number of marks', () => {
    doors.forEach((door) => {
      const { drip, marks } = door.graffiti!;

      if (drip === 'single' || drip === 'soft') {
        expect(marks.length).toBe(1);
      } else {
        // A curtain of runs or a splash needs enough marks to read as one.
        expect(marks.length).toBeGreaterThanOrEqual(5);
      }
    });
  });

  it('keeps a splash round apart from the heavy specks that ran', () => {
    const splashed = doors.filter((door) => door.graffiti!.drip === 'splash');
    expect(splashed.length).toBeGreaterThan(0);

    splashed.forEach((door) => {
      const marks = door.graffiti!.marks;
      // Round specks have no run; the ones drawn as runs are the heavy
      // ones, and those are the only marks in a splash with a length.
      marks.forEach((mark) => {
        if (mark.round) expect(mark.length).toBe(0);
        else expect(mark.length).toBeGreaterThan(0);
      });
      expect(marks.some((mark) => mark.round)).toBeTrue();
    });
  });

  it('never flings paint off the side of the door', () => {
    doors.forEach((door) => {
      door.graffiti!.marks.forEach((mark) => {
        expect(mark.x).toBeGreaterThanOrEqual(0);
        expect(mark.x).toBeLessThanOrEqual(100);
        // Paint runs off the bottom and is clipped there, which is what it
        // would really do, but it never starts below the door.
        expect(mark.y).toBeGreaterThanOrEqual(0);
        expect(mark.y).toBeLessThanOrEqual(100);
      });
    });
  });

  it('gives the same door the same tag every time', () => {
    const once = characterForDoor('door-42', 42).graffiti;
    const again = characterForDoor('door-42', 42).graffiti;
    expect(again).toEqual(once);
  });
});
