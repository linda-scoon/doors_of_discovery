import { TestBed } from '@angular/core/testing';

import { PetRoomComponent } from './pet-room.component';

describe('PetRoomComponent', () => {
  afterEach(() => vi.useRealTimers());

  function open() {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(PetRoomComponent);
    fixture.detectChanges();
    return { fixture, pip: fixture.componentInstance };
  }

  it('purrs when stroked, then settles', () => {
    const { pip } = open();
    pip.stroke();
    expect(pip.mood()).toBe('purring');
    expect(pip.hearts().length).toBeGreaterThan(0);

    vi.advanceTimersByTime(2_000);
    expect(pip.mood()).toBe('content');
  });

  it('squeaks when poked, and sulks when poked too often', () => {
    const { pip } = open();
    pip.poke();
    expect(pip.mood()).toBe('surprised');

    pip.poke();
    pip.poke();
    pip.poke();
    expect(pip.mood()).toBe('grumpy');
  });

  it('eats what it is given, is happy, and the snack comes back later', () => {
    const { pip } = open();
    const fish = pip.foods()[0];

    pip.feed(fish);
    expect(pip.mood()).toBe('eating');
    expect(pip.foods()[0].eaten).toBe(true);

    vi.advanceTimersByTime(1_000);
    expect(pip.mood()).toBe('happy');

    vi.advanceTimersByTime(4_000);
    expect(pip.foods()[0].eaten).toBe(false);
  });

  it('can be fed from the keyboard', () => {
    const { fixture, pip } = open();
    const cookie: HTMLElement = fixture.nativeElement.querySelector('[aria-label="Give Pip a cookie"]');

    cookie.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(pip.mood()).toBe('eating');
  });
});
