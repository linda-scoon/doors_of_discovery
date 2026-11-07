import { TestBed } from '@angular/core/testing';

import { MoonRoomComponent } from './moon-room.component';
import { moonOn } from './moon';
import { readingFor } from './luck';

describe('the moon', () => {
  it('knows a full moon and a new moon', () => {
    // Full moon, 23 June 2021; new moon, 10 June 2021.
    const full = moonOn(new Date(Date.UTC(2021, 5, 24, 18, 40)));
    const fresh = moonOn(new Date(Date.UTC(2021, 5, 10, 10, 53)));

    expect(full.phase).toBe('Full moon');
    expect(full.illumination).toBeGreaterThan(0.97);
    expect(fresh.phase).toBe('New moon');
    expect(fresh.illumination).toBeLessThan(0.03);
  });

  it('knows which sign the moon is in, even on the cusp', () => {
    // 1 January 2024, noon UTC: Virgo. The June 2021 full moon: Capricorn.
    expect(moonOn(new Date(Date.UTC(2024, 0, 1, 12))).sign).toBe('Virgo');
    expect(moonOn(new Date(Date.UTC(2021, 5, 24, 18, 40))).sign).toBe('Capricorn');
    // 7 November 2026, 21:00 UTC: the last degree of Libra, not yet Scorpio.
    expect(moonOn(new Date(Date.UTC(2026, 10, 7, 21))).sign).toBe('Libra');
  });
});

describe('the day\'s luck', () => {
  it('is the same all day for everyone, and kind', () => {
    const morning = new Date(2026, 10, 7, 8);
    const evening = new Date(2026, 10, 7, 22);
    const a = readingFor(moonOn(morning), morning);
    const b = readingFor(moonOn(evening), evening);

    expect(a.stars).toBe(b.stars);
    expect(a.number).toBe(b.number);
    expect(a.stars).toBeGreaterThanOrEqual(2);
  });
});

describe('MoonRoomComponent', () => {
  it('draws the moon and gives a reading', () => {
    const fixture = TestBed.createComponent(MoonRoomComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent!;

    expect(fixture.nativeElement.querySelector('path').getAttribute('d')).toContain('A ');
    expect(text).toContain(fixture.componentInstance.moon.phase);
    expect(text).toContain('Lucky number');
  });
});
