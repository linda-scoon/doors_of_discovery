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

import { ROOM_KINDS } from './rooms';
import { Deck, WallCell } from './wall';

/** How many doors to add each time the visitor reaches the bottom. */
const DOORS_PER_PAGE = 12;

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
  private readonly deck = new Deck(ROOM_KINDS);

  /** The wall, door by door. It grows as the visitor scrolls. */
  doors: WallCell[] = [];

  constructor() {
    // Filled here rather than in ngAfterViewInit. Adding doors from a
    // lifecycle hook that runs after the view is rendered changes state the
    // template has already been checked against, which Angular rightly
    // complains about.
    this.addDoors(DOORS_PER_PAGE * 3);
  }

  /** Watched by the observer; reaching it means asking for more doors. */
  @ViewChild('endOfWall') endOfWall?: ElementRef<HTMLElement>;

  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
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
  }

  private addDoors(count: number): void {
    this.doors = [...this.doors, ...this.deck.take(count)];
  }
}
