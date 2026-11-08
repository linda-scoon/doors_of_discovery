import { TestBed } from '@angular/core/testing';

import { FlagsRoomComponent } from './flags-room.component';
import { COUNTRIES } from './countries';

describe('FlagsRoomComponent', () => {
  it('asks with four different countries, one of them right', () => {
    const room = TestBed.createComponent(FlagsRoomComponent).componentInstance;
    const { answer, choices } = room.question();
    expect(new Set(choices).size).toBe(4);
    expect(choices).toContain(answer);
    expect(room.flagOf(answer)).toBe(`https://flagcdn.com/w320/${answer.code}.png`);
  });

  it('keeps score, and only counts the first pick', () => {
    const room = TestBed.createComponent(FlagsRoomComponent).componentInstance;
    const { answer, choices } = room.question();
    room.pick(answer);
    room.pick(choices.find((c) => c !== answer)!);
    expect([room.right(), room.asked()]).toEqual([1, 1]);
    expect(room.verdict()).toBe('Right!');

    room.next();
    const next = room.question();
    room.pick(next.choices.find((c) => c !== next.answer)!);
    expect([room.right(), room.asked()]).toEqual([1, 2]);
    expect(room.verdict()).toContain(next.answer.name);
  });

  it('has each country once, with a two-letter code', () => {
    expect(new Set(COUNTRIES.map((c) => c.code)).size).toBe(COUNTRIES.length);
    expect(COUNTRIES.every((c) => /^[a-z]{2}$/.test(c.code))).toBe(true);
  });
});
