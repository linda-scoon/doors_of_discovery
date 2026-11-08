import { TestBed } from '@angular/core/testing';

import { PlanetsRoomComponent } from './planets-room.component';
import { BODIES } from './planets';

describe('PlanetsRoomComponent', () => {
  afterEach(() => vi.restoreAllMocks());

  it('travels outward and inward, stopping at the ends', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const fixture = TestBed.createComponent(PlanetsRoomComponent);
    const room = fixture.componentInstance;
    fixture.detectChanges();
    expect(room.planet().name).toBe('The Sun');

    room.go(-1);
    expect(room.planet().name).toBe('The Sun');
    room.go(1);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Mercury');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Planet 1 from the Sun');

    for (let i = 0; i < 20; i += 1) room.go(1);
    expect(room.planet().name).toBe('Pluto');
    // Pluto is the end of the planets; the moons are a different part of the sky.
  });

  it('shows NASA photographs from Wikimedia Commons, and a plain globe if one will not load', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.35);
    const fixture = TestBed.createComponent(PlanetsRoomComponent);
    fixture.detectChanges();
    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(image.src).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\//);

    image.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.querySelector('.planet__stand-in')).not.toBeNull();
  });

  it('knows every planet, in order, and keeps to one part of the sky', () => {
    expect(BODIES.filter((b) => b.group === 'The Sun and planets').map((b) => b.name)).toEqual([
      'The Sun', 'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
    ]);

    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    const room = TestBed.createComponent(PlanetsRoomComponent).componentInstance;
    const group = room.planet().group;
    for (let i = 0; i < 60; i += 1) {
      room.go(-1);
      expect(room.planet().group).toBe(group);
    }
  });

  it('credits every photograph, each its own', () => {
    expect(BODIES.every((b) => b.credit && b.file && b.fact && b.facts.length)).toBe(true);
    expect(new Set(BODIES.map((b) => b.file)).size).toBe(BODIES.length);
  });
});
