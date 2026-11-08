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

  it('chirps when poked, and sulks when poked too often', () => {
    const { pip } = open();
    pip.poke();
    expect(pip.mood()).toBe('surprised');

    pip.poke();
    pip.poke();
    pip.poke();
    expect(pip.mood()).toBe('grumpy');
  });

  it('eats what it is given and is happy, and the snack stays eaten', () => {
    const { pip } = open();
    pip.feed(pip.foods()[0]);
    expect(pip.mood()).toBe('eating');
    expect(pip.foods()[0].eaten).toBe(true);

    vi.advanceTimersByTime(1_000);
    expect(pip.mood()).toBe('happy');

    vi.advanceTimersByTime(60_000);
    expect(pip.foods()[0].eaten).toBe(true);
  });

  it('is full once everything is eaten, until the door is opened again', () => {
    const { pip } = open();
    pip.foods().forEach((food) => pip.feed(food));
    vi.advanceTimersByTime(1_000);
    expect(pip.mood()).toBe('full');

    // Opening the door again builds the room afresh, snacks and all.
    const again = TestBed.createComponent(PetRoomComponent).componentInstance;
    expect(again.foods().every((food) => !food.eaten)).toBe(true);
  });

  it('can be fed from the keyboard', () => {
    const { fixture, pip } = open();
    const fish: HTMLElement = fixture.nativeElement.querySelector('[aria-label="Give Pip a fish"]');

    fish.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(pip.mood()).toBe('eating');
  });
});
