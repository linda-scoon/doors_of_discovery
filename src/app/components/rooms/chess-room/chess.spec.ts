import { applyMove, parseFen } from './chess';

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

describe('chess moves', () => {
  it('reads a position', () => {
    const { board, toMove } = parseFen(START);
    expect(toMove).toBe('w');
    expect(board[7][4]).toBe('K');
    expect(board[0][3]).toBe('q');
    expect(board[4][4]).toBeNull();
  });

  it('refuses something that is not a position', () => {
    expect(() => parseFen('not a fen')).toThrow();
    expect(() => parseFen('8/8/8 w')).toThrow();
  });

  it('moves and captures, leaving the old board alone', () => {
    const start = parseFen(START);
    const after = applyMove(start, 'e2e4');
    expect(after.board[4][4]).toBe('P');
    expect(after.board[6][4]).toBeNull();
    expect(after.toMove).toBe('b');
    expect(start.board[6][4]).toBe('P');
  });

  it('castles, moving the rook too', () => {
    const position = parseFen('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
    const short = applyMove(position, 'e1g1');
    expect(short.board[7][6]).toBe('K');
    expect(short.board[7][5]).toBe('R');
    expect(short.board[7][7]).toBeNull();
    const long = applyMove(applyMove(position, 'a1a2'), 'e8c8');
    expect(long.board[0][2]).toBe('k');
    expect(long.board[0][3]).toBe('r');
  });

  it('takes en passant', () => {
    const position = parseFen('8/8/8/3pP3/8/8/8/4K2k w - d6 0 1');
    const after = applyMove(position, 'e5d6');
    expect(after.board[2][3]).toBe('P');
    expect(after.board[3][3]).toBeNull();
  });

  it('promotes', () => {
    const after = applyMove(parseFen('8/4P3/8/8/8/8/8/4K2k w - - 0 1'), 'e7e8n');
    expect(after.board[0][4]).toBe('N');
  });
});
