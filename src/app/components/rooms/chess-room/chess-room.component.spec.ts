import { ChessRoomComponent } from './chess-room.component';
import { failRequest, openRoom } from '../room-frame/room-testing';

const DAILY = {
  puzzle: {
    id: 'xSeW5',
    rating: 1881,
    solution: ['f1f4', 'e4c2', 'f4d4'],
    fen: 'r3r1k1/ppp2p2/3p1Pp1/7p/2Pbq2Q/8/PP1B2PP/R4R1K w - - 0 1',
    lastMove: 'e5e4',
  },
};

function square(room: Awaited<ReturnType<typeof openRoom<ChessRoomComponent>>>, name: string): HTMLButtonElement {
  room.fixture.detectChanges();
  return room.fixture.nativeElement.querySelector(`[aria-label^="${name}"]`);
}

describe('ChessRoomComponent', () => {
  it('plays through the puzzle, answering each right move', async () => {
    vi.useFakeTimers();
    try {
      const room = await openRoom(ChessRoomComponent);
      room.server.expectOne('/api/chess').flush(DAILY);
      expect(room.text()).toContain('White to play');

      square(room, 'f1').click();
      square(room, 'f2').click();
      expect(room.text()).toContain('Not quite');

      square(room, 'f1').click();
      square(room, 'f4').click();
      expect(room.text()).toContain('Good move');
      vi.advanceTimersByTime(600);
      expect(square(room, 'c2').getAttribute('aria-label')).toBe('c2, black queen');

      square(room, 'f4').click();
      square(room, 'd4').click();
      expect(room.text()).toContain('Solved');
      expect(square(room, 'd4').getAttribute('aria-label')).toBe('d4, white rook');
    } finally {
      vi.useRealTimers();
    }
  });

  it('turns the board round for Black', async () => {
    const room = await openRoom(ChessRoomComponent);
    room.server.expectOne('/api/chess').flush({
      puzzle: { ...DAILY.puzzle, fen: DAILY.puzzle.fen.replace(' w ', ' b ') },
    });
    room.fixture.detectChanges();
    const first = room.fixture.nativeElement.querySelector('.chess__square') as HTMLElement;
    expect(first.getAttribute('aria-label')).toMatch(/^h1/);
  });

  it('is bricked up when there is no puzzle', async () => {
    const room = await openRoom(ChessRoomComponent);
    failRequest(room.server, '/api/chess');
    expect(room.bricked()).toBe(true);
  });
});
