import { TestBed } from '@angular/core/testing';

import { BubblesRoomComponent } from './bubbles-room.component';

describe('BubblesRoomComponent', () => {
  it('blows a stream of bubbles that can be popped', () => {
    vi.useFakeTimers();
    try {
      const fixture = TestBed.createComponent(BubblesRoomComponent);
      const room = fixture.componentInstance;
      room.blow();
      vi.advanceTimersByTime(2000);
      const blown = room.bubbles().length;
      expect(blown).toBeGreaterThanOrEqual(7);

      fixture.detectChanges();
      const bubble = fixture.nativeElement.querySelector('.bubble') as HTMLElement;
      bubble.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      expect(room.bubbles().length).toBe(blown - 1);
      expect(room.popped()).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
