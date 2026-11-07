import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  inject,
} from '@angular/core';

import { ROOMS } from './rooms';
import { Deck, HungDoor, WallLayout } from './wall';

/** How many doors to add each time the visitor reaches the bottom. */
const DOORS_PER_PAGE = 12;

/**
 * How many cells across the wall is, by screen width. A standard door is
 * two cells wide, so this is two standard doors to a row on a phone, and
 * more as the screen allows.
 */
const COLUMNS_BY_WIDTH: ReadonlyArray<[query: string, cols: number]> = [
  ['(min-width: 85rem)', 10],
  ['(min-width: 60rem)', 8],
  ['(min-width: 40rem)', 6],
];
const NARROWEST_COLUMNS = 4;

function columnsForScreen(): number {
  if (typeof matchMedia === 'undefined') return NARROWEST_COLUMNS;
  const match = COLUMNS_BY_WIDTH.find(([query]) => matchMedia(query).matches);
  return match ? match[1] : NARROWEST_COLUMNS;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class AppComponent implements AfterViewInit, OnDestroy {
  private readonly changeDetector = inject(ChangeDetectorRef);

  title: string = 'web_of_doors';

  /** Every door, in this visit's order. */
  private readonly deck = new Deck(ROOMS);

  /** Where each door goes, for the current screen width. */
  layout = new WallLayout(this.deck, columnsForScreen());

  /**
   * The doors on the wall. The rooms with an API behind them are shuffled
   * in among the first of them, and the wall grows as the visitor scrolls.
   */
  doors: HungDoor[] = [];

  constructor() {
    // Filled here rather than in ngAfterViewInit. Adding doors from a
    // lifecycle hook that runs after the view is rendered changes state the
    // template has already been checked against, which Angular rightly
    // complains about.
    this.addDoors(ROOMS.length + DOORS_PER_PAGE * 2);
  }

  /** Watched by the observer; reaching it means asking for more doors. */
  @ViewChild('endOfWall') endOfWall?: ElementRef<HTMLElement>;

  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    this.watchScreenWidth();

    if (!this.endOfWall || typeof IntersectionObserver === 'undefined') return;

    this.observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        this.addDoors(DOORS_PER_PAGE);
        this.changeDetector.detectChanges();
      },
      // Start fetching before the visitor actually hits the bottom.
      { rootMargin: '600px' }
    );
    this.observer.observe(this.endOfWall.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.stopWatchingWidth?.();
  }

  private stopWatchingWidth?: () => void;

  /**
   * The wall is laid out for a number of columns, so a change in that --
   * turning a phone on its side, resizing a window across a breakpoint --
   * lays the same doors out again for the new width.
   */
  private watchScreenWidth(): void {
    if (typeof matchMedia === 'undefined') return;

    const relayout = () => {
      const cols = columnsForScreen();
      if (cols === this.layout.cols) return;

      const dealt = this.layout.dealt;
      this.layout = new WallLayout(this.deck, cols);
      this.doors = this.layout.hang(dealt);
      this.changeDetector.detectChanges();
    };

    const queries = COLUMNS_BY_WIDTH.map(([query]) => matchMedia(query));
    queries.forEach((query) => query.addEventListener('change', relayout));
    this.stopWatchingWidth = () =>
      queries.forEach((query) => query.removeEventListener('change', relayout));
  }

  private addDoors(count: number): void {
    this.doors = [...this.doors, ...this.layout.hang(count)];
  }
}
