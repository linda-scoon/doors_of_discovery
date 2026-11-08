import { TestBed } from '@angular/core/testing';

import { MemoryRoomComponent } from './memory-room.component';

describe('MemoryRoomComponent', () => {
  it('keeps a pair that matches and turns back one that does not', () => {
    vi.useFakeTimers();
    try {
      const game = TestBed.createComponent(MemoryRoomComponent).componentInstance;
      const cards = game.cards();
      expect(cards.length).toBe(12);

      const first = 0;
      const twin = cards.findIndex((c, i) => i !== first && c.face === cards[first].face);
      const stranger = cards.findIndex((c) => c.face !== cards[first].face);

      game.turn(first);
      game.turn(stranger);
      vi.advanceTimersByTime(800);
      expect(game.cards().filter((c) => c.up).length).toBe(0);

      game.turn(first);
      game.turn(twin);
      expect(game.cards()[first].matched && game.cards()[twin].matched).toBe(true);
      expect(game.moves()).toBe(2);
    } finally {
      vi.useRealTimers();
    }
  });
});
