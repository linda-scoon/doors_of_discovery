import { TestBed } from '@angular/core/testing';

import { BubblesRoomComponent } from './bubbles-room.component';

describe('BubblesRoomComponent', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('lifts the wand, blows, and puts it down again', () => {
    const room = TestBed.createComponent(BubblesRoomComponent).componentInstance;
    expect(room.pose()).toBe('rest');

    room.blow();
    expect(room.pose()).toBe('up');
    expect(room.bubbles().length).toBe(0);

    vi.advanceTimersByTime(460);
    expect(room.pose()).toBe('blowing');
    expect(room.bubbles().length).toBe(1);

    // Pressing again mid-breath does not start another.
    room.blow();
    vi.advanceTimersByTime(3000);
    expect(room.pose()).toBe('rest');
    expect(room.bubbles().length).toBeGreaterThanOrEqual(7);
    expect(room.bubbles().length).toBeLessThanOrEqual(10);
  });

  it('pops a bubble when it is tapped', () => {
    const fixture = TestBed.createComponent(BubblesRoomComponent);
    const room = fixture.componentInstance;
    room.blow();
    vi.advanceTimersByTime(3000);
    const blown = room.bubbles().length;

    fixture.detectChanges();
    const bubble = fixture.nativeElement.querySelector('.bubble') as HTMLElement;
    bubble.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(room.bubbles().length).toBe(blown - 1);
    expect(room.popped()).toBe(1);
  });
});
