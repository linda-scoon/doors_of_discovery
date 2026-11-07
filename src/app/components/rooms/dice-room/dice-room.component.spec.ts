import { TestBed } from '@angular/core/testing';

import { DiceRoomComponent, pipsFor } from './dice-room.component';

describe('dice', () => {
  it('draws the right number of pips on each face', () => {
    for (let face = 1; face <= 6; face += 1) {
      expect(pipsFor(face).filter(Boolean).length).toBe(face);
    }
  });

  it('rolls them all, and adds them up when they land', () => {
    vi.useFakeTimers();
    try {
      const fixture = TestBed.createComponent(DiceRoomComponent);
      fixture.detectChanges();
      const room = fixture.componentInstance;
      room.rollAll();
      expect(room.caption()).toBe('Rattle…');
      vi.advanceTimersByTime(700);

      const faces = room.dice().map((d) => d.face);
      expect(room.thrown()).toEqual(faces);
      expect(room.caption()).toContain(`= ${faces.reduce((a, b) => a + b, 0)}`);
      expect(room.dice().every((d) => d.x >= 11 && d.x <= 89 && d.y >= 10 && d.y <= 90)).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('picks up a die, gathers others it passes over, and throws only those', () => {
    vi.useFakeTimers();
    try {
      const fixture = TestBed.createComponent(DiceRoomComponent);
      fixture.detectChanges();
      const room = fixture.componentInstance;
      const dice = fixture.nativeElement.querySelectorAll('[data-die]') as NodeListOf<HTMLElement>;
      const before = room.dice().map((d) => d.face);

      // With no layout in the test, every pointer position reads as the
      // middle of the table -- where the third die sits.
      dice[0].dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      expect(room.dice().filter((d) => d.held).length).toBe(1);
      dice[0].dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
      dice[0].dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
      vi.advanceTimersByTime(700);

      expect(room.thrown()!.length).toBe(1);
      expect(room.dice()[4].face).toBe(before[4]);
    } finally {
      vi.useRealTimers();
    }
  });
});
