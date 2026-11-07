import { TestBed } from '@angular/core/testing';

import { TicTacToeRoomComponent, houseMove, winnerOf } from './tic-tac-toe-room.component';

const X = 'X';
const O = 'O';
const _ = null;

describe('noughts and crosses', () => {
  it('knows three in a row', () => {
    expect(winnerOf([X, X, X, _, O, O, _, _, _])).toBe('X');
    expect(winnerOf([O, X, X, _, O, X, _, _, O])).toBe('O');
    expect(winnerOf([X, O, X, _, _, _, _, _, _])).toBeNull();
  });

  it('takes a win when it has one', () => {
    expect(houseMove([O, O, _, X, X, _, X, _, _], () => 0.5)).toBe(2);
  });

  it('blocks, unless it slips', () => {
    expect(houseMove([X, X, _, _, O, _, _, _, _], () => 0.5)).toBe(2);
  });

  it('answers a move after a moment', () => {
    vi.useFakeTimers();
    try {
      const game = TestBed.createComponent(TicTacToeRoomComponent).componentInstance;
      game.play(0);
      expect(game.board().filter(Boolean).length).toBe(1);

      vi.advanceTimersByTime(500);
      expect(game.board().filter((c) => c === 'O').length).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
