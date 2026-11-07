import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';

import { RoomFrameComponent } from '../room-frame/room-frame.component';

type Mark = 'X' | 'O';
type Cell = Mark | null;

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

/** Who has three in a row, if anyone. */
export function winnerOf(board: readonly Cell[]): Mark | null {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

/**
 * Where the house plays. Wins if it can, blocks if it must, and otherwise
 * likes the middle, then the corners. One move in five it just plays
 * anywhere, so it can be beaten.
 */
export function houseMove(board: readonly Cell[], random: () => number = Math.random): number {
  const empty = board.map((cell, i) => (cell ? -1 : i)).filter((i) => i >= 0);
  const completes = (mark: Mark) =>
    empty.find((i) => winnerOf(board.map((cell, j) => (j === i ? mark : cell))) === mark);

  const win = completes('O');
  if (win !== undefined) return win;
  const block = completes('X');
  if (block !== undefined && random() > 0.2) return block;
  if (random() < 0.2) return empty[Math.floor(random() * empty.length)];
  for (const preferred of [4, 0, 2, 6, 8, 1, 3, 5, 7]) {
    if (empty.includes(preferred)) return preferred;
  }
  return empty[0];
}

/** Someone in here wants a game of noughts and crosses. You go first. */
@Component({
  selector: 'app-tic-tac-toe-room',
  imports: [RoomFrameComponent],
  templateUrl: './tic-tac-toe-room.component.html',
  styleUrls: ['./tic-tac-toe-room.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicTacToeRoomComponent {
  readonly board = signal<Cell[]>(Array(9).fill(null));
  readonly thinking = signal(false);

  readonly winner = computed(() => winnerOf(this.board()));
  readonly full = computed(() => this.board().every(Boolean));
  readonly over = computed(() => Boolean(this.winner()) || this.full());

  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  play(index: number): void {
    if (this.thinking() || this.over() || this.board()[index]) return;

    this.place(index, 'X');
    if (this.over()) return;

    // A moment's thought, so the reply does not land in the same instant.
    this.thinking.set(true);
    this.timer = setTimeout(() => {
      this.place(houseMove(this.board()), 'O');
      this.thinking.set(false);
    }, 450);
  }

  again(): void {
    clearTimeout(this.timer);
    this.thinking.set(false);
    this.board.set(Array(9).fill(null));
  }

  private place(index: number, mark: Mark): void {
    this.board.update((board) => board.map((cell, i) => (i === index ? mark : cell)));
  }
}
