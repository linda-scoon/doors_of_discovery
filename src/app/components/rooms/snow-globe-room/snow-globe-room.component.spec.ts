import { TestBed } from '@angular/core/testing';

import { SnowGlobeRoomComponent } from './snow-globe-room.component';

describe('SnowGlobeRoomComponent', () => {
  it('is full of snow, and shakes', () => {
    vi.useFakeTimers();
    try {
      const globe = TestBed.createComponent(SnowGlobeRoomComponent).componentInstance;
      expect(globe.snow().length).toBeGreaterThan(10);
      globe.shake();
      expect(globe.shaking()).toBe(true);
      vi.advanceTimersByTime(2000);
      expect(globe.shaking()).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});
