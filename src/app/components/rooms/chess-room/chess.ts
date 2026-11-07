/**
 * Just enough chess to replay a puzzle: read a position from FEN and make
 * moves given in UCI ("e2e4", "e7e8q"), castling, en passant and promotion
 * included. It does not check that a move is legal -- the puzzle's own
 * solution decides what is right.
 */

/** A piece as FEN writes it: upper case white, lower case black. Null is empty. */
export type Square = string | null;

/** board[0] is the eighth rank, board[7] the first; files a to h left to right. */
export type Board = Square[][];

export interface Position {
  board: Board;
  toMove: 'w' | 'b';
}

export function parseFen(fen: string): Position {
  const [placement, toMove] = fen.trim().split(/\s+/);
  const ranks = placement?.split('/') ?? [];
  if (ranks.length !== 8 || (toMove !== 'w' && toMove !== 'b')) throw new Error('Not a FEN position');
  const board = ranks.map((rank) => {
    const row: Square[] = [];
    for (const c of rank) {
      if (/\d/.test(c)) row.push(...Array<Square>(Number(c)).fill(null));
      else if (/[prnbqk]/i.test(c)) row.push(c);
      else throw new Error('Not a FEN position');
    }
    if (row.length !== 8) throw new Error('Not a FEN position');
    return row;
  });
  return { board, toMove };
}

/** "e4" -> [row, column] on the board. */
export function coordinates(square: string): [number, number] {
  return [8 - Number(square[1]), square.charCodeAt(0) - 97];
}

export function squareName(row: number, column: number): string {
  return String.fromCharCode(97 + column) + (8 - row);
}

export function isWhite(piece: Square): boolean {
  return piece !== null && piece === piece.toUpperCase();
}

/** The position after a move, which is a new board: the old one is untouched. */
export function applyMove(position: Position, uci: string): Position {
  const board = position.board.map((row) => [...row]);
  const [fromRow, fromColumn] = coordinates(uci.slice(0, 2));
  const [toRow, toColumn] = coordinates(uci.slice(2, 4));
  const piece = board[fromRow][fromColumn];
  if (!piece) throw new Error(`No piece on ${uci.slice(0, 2)}`);
  const kind = piece.toLowerCase();

  // Castling: the king moves two squares, and the rook jumps over it.
  if (kind === 'k' && Math.abs(toColumn - fromColumn) === 2) {
    const [rookFrom, rookTo] = toColumn > fromColumn ? [7, 5] : [0, 3];
    board[fromRow][rookTo] = board[fromRow][rookFrom];
    board[fromRow][rookFrom] = null;
  }

  // En passant: a pawn moving diagonally onto an empty square takes the pawn beside it.
  if (kind === 'p' && fromColumn !== toColumn && !board[toRow][toColumn]) {
    board[fromRow][toColumn] = null;
  }

  board[toRow][toColumn] = uci[4] ? (isWhite(piece) ? uci[4].toUpperCase() : uci[4].toLowerCase()) : piece;
  board[fromRow][fromColumn] = null;

  return { board, toMove: position.toMove === 'w' ? 'b' : 'w' };
}
