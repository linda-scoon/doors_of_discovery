import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { roomLoad } from '../room-frame/room-load';
import { chime } from '../room-frame/tones';
import { Position, Square, applyMove, isWhite, parseFen, squareName } from './chess';

interface DailyPuzzle {
  puzzle: { id: string; fen?: string; solution: string[]; lastMove?: string; rating?: number };
}

interface Puzzle {
  id: string;
  start: Position;
  solution: string[];
  lastMove?: string;
  rating?: number;
}

/** Drawn with the solid glyphs for both sides and coloured, so they match. */
const GLYPHS: Record<string, string> = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };

/**
 * The Lichess puzzle of the day. Find the best move: pick up a piece, put
 * it down where it should go, and the board answers with the reply until
 * the puzzle is solved.
 */
@Component({
  selector: 'app-chess-room',
  imports: [RoomFrameComponent],
  template: `
    <app-room-frame [status]="puzzle.status()">
      @if (puzzle.value(); as p) {
        <p class="chess__heading">Puzzle of the day{{ p.rating ? ' · rated ' + p.rating : '' }}</p>
        <div class="chess__board" [class.chess__board--solved]="solved()">
          @for (row of rows(); track row) {
            @for (column of columns(); track column) {
              <button type="button" class="chess__square"
                      [class.chess__square--dark]="(row + column) % 2 === 1"
                      [class.chess__square--picked]="picked() === name(row, column)"
                      [class.chess__square--last]="lastMove().includes(name(row, column))"
                      [class.chess__square--hint]="hint() === name(row, column)"
                      [class.chess__square--wrong]="wrong() === name(row, column)"
                      [attr.aria-label]="describe(row, column)"
                      (click)="choose(row, column)">
                @if (position().board[row][column]; as piece) {
                  <span class="chess__piece" [class.chess__piece--white]="white(piece)">{{ glyph(piece) }}</span>
                }
              </button>
            }
          }
        </div>
        <p class="room-words room-words--small" aria-live="polite">{{ message() }}</p>
        <div class="chess__actions">
          @if (!solved()) {
            <button type="button" class="room-button" (click)="showMe()">Show me</button>
          }
          <button type="button" class="room-button" (click)="restart()">Start again</button>
        </div>
        <p class="room-credit">
          <a [href]="'https://lichess.org/training/' + p.id" target="_blank" rel="noopener">Today's puzzle on Lichess</a>
        </p>
      }
    </app-room-frame>
  `,
  styles: `
    :host { display: contents; }
    app-room-frame {
      background: radial-gradient(ellipse at 50% 20%, #3b3f4a, #16181d);
      color: #ece6da;
      gap: 3cqi;
      padding: 7cqi 5cqi;
    }
    .chess__heading { font-size: clamp(0.6rem, 4.2cqi, 0.8rem); letter-spacing: 0.12em; text-transform: uppercase; }
    .chess__board {
      display: grid;
      grid-template: repeat(8, minmax(0, 1fr)) / repeat(8, minmax(0, 1fr));
      width: min(90cqi, 62cqh);
      aspect-ratio: 1;
      border: 1.4cqi solid #5b3a1e;
      border-radius: 1cqi;
      box-shadow: 0 2cqi 5cqi rgba(0, 0, 0, 0.6);
      flex-shrink: 0;
    }
    .chess__board--solved { box-shadow: 0 0 0 1cqi #8bc34a, 0 2cqi 5cqi rgba(0, 0, 0, 0.6); }
    .chess__square {
      position: relative;
      display: grid;
      place-items: center;
      padding: 0;
      border: 0;
      background: #f0d9b5;
      cursor: pointer;
      font: inherit;
      min-width: 0;
      min-height: 0;
      overflow: hidden;
    }
    .chess__square--dark { background: #b58863; }
    .chess__square--last::after { content: ''; position: absolute; inset: 0; background: rgba(205, 210, 106, 0.55); }
    .chess__square--picked::after { content: ''; position: absolute; inset: 0; background: rgba(20, 85, 30, 0.5); }
    .chess__square--hint::after { content: ''; position: absolute; inset: 8%; border-radius: 50%; box-shadow: inset 0 0 0 0.9cqi #4fc3f7; }
    .chess__square--wrong::after { content: ''; position: absolute; inset: 0; background: rgba(220, 40, 40, 0.55); }
    .chess__piece {
      position: relative;
      z-index: 1;
      font-size: min(9cqi, 6.2cqh);
      line-height: 1;
      color: #1a1a1a;
      font-variant-emoji: text;
      font-family: 'DejaVu Sans', 'Segoe UI Symbol', 'Noto Sans Symbols 2', serif;
    }
    .chess__piece--white {
      color: #ffffff;
      text-shadow: 0 0 1px #000, 0 0 1px #000, 0 0 1px #000;
    }
    .chess__actions { display: flex; gap: 2cqi; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChessRoomComponent {
  private readonly http = inject(HttpClient);
  private timer: ReturnType<typeof setTimeout> | undefined;

  readonly puzzle = roomLoad(() =>
    this.http.get<DailyPuzzle>('/api/chess').pipe(
      map(({ puzzle }) => {
        if (!puzzle?.fen || !puzzle.solution?.length) throw new Error('No puzzle today');
        const p: Puzzle = {
          id: puzzle.id,
          start: parseFen(puzzle.fen),
          solution: puzzle.solution,
          lastMove: puzzle.lastMove,
          rating: puzzle.rating,
        };
        this.begin(p);
        return p;
      })
    )
  );

  /** How many moves of the solution have been played, both sides counted. */
  private readonly played = signal(0);
  private readonly current = signal<Position | null>(null);
  readonly picked = signal<string | null>(null);
  readonly hint = signal<string | null>(null);
  readonly wrong = signal<string | null>(null);
  readonly note = signal('');
  private readonly lastPlayed = signal<string | undefined>(undefined);

  readonly position = computed(() => this.current()!);
  readonly player = computed(() => this.puzzle.value()?.start.toMove ?? 'w');
  readonly solved = computed(() => {
    const p = this.puzzle.value();
    return Boolean(p && this.played() >= p.solution.length);
  });
  /** White at the bottom for White's puzzle, Black at the bottom for Black's. */
  readonly rows = computed(() => (this.player() === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0]));
  readonly columns = computed(() => (this.player() === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0]));
  readonly lastMove = computed(() => {
    const move = this.lastPlayed();
    return move ? [move.slice(0, 2), move.slice(2, 4)] : [];
  });
  readonly message = computed(() => {
    if (this.solved()) return 'Solved! Well played.';
    return this.note() || `${this.player() === 'w' ? 'White' : 'Black'} to play. Find the best move.`;
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  name(row: number, column: number): string {
    return squareName(row, column);
  }

  glyph(piece: string): string {
    return GLYPHS[piece.toLowerCase()] + '︎';
  }

  white(piece: Square): boolean {
    return isWhite(piece);
  }

  describe(row: number, column: number): string {
    const piece = this.position().board[row][column];
    const names: Record<string, string> = { k: 'king', q: 'queen', r: 'rook', b: 'bishop', n: 'knight', p: 'pawn' };
    return `${squareName(row, column)}${piece ? ', ' + (isWhite(piece) ? 'white ' : 'black ') + names[piece.toLowerCase()] : ''}`;
  }

  choose(row: number, column: number): void {
    const puzzle = this.puzzle.value();
    if (!puzzle || this.solved() || this.timer) return;
    const square = squareName(row, column);
    const piece = this.position().board[row][column];
    const mine = piece !== null && isWhite(piece) === (this.player() === 'w');

    if (mine) {
      this.picked.set(this.picked() === square ? null : square);
      return;
    }
    const from = this.picked();
    if (!from) return;

    const expected = puzzle.solution[this.played()];
    this.picked.set(null);
    if (expected.slice(0, 4) !== from + square) {
      this.wrong.set(square);
      this.note.set('Not quite. Try again.');
      setTimeout(() => this.wrong.set(null), 600);
      return;
    }
    this.play(expected);
    if (this.solved()) {
      chime();
      return;
    }
    this.note.set('Good move. Keep going.');
    this.timer = setTimeout(() => {
      this.timer = undefined;
      this.play(puzzle.solution[this.played()]);
    }, 550);
  }

  showMe(): void {
    const puzzle = this.puzzle.value();
    if (!puzzle || this.solved()) return;
    const expected = puzzle.solution[this.played()];
    this.hint.set(this.hint() === expected.slice(0, 2) ? expected.slice(2, 4) : expected.slice(0, 2));
  }

  restart(): void {
    const puzzle = this.puzzle.value();
    if (puzzle) this.begin(puzzle);
  }

  private begin(puzzle: Puzzle): void {
    clearTimeout(this.timer);
    this.timer = undefined;
    this.current.set(puzzle.start);
    this.played.set(0);
    this.picked.set(null);
    this.hint.set(null);
    this.note.set('');
    this.lastPlayed.set(puzzle.lastMove);
  }

  private play(move: string): void {
    this.current.set(applyMove(this.position(), move));
    this.played.update((n) => n + 1);
    this.lastPlayed.set(move);
    this.hint.set(null);
  }
}
