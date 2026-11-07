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

import { ROOMS, RoomDefinition } from './rooms';
import { EmptyRoomComponent } from './components/rooms/empty-room/empty-room.component';

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

  /**
   * The doors on the wall. Begins with the rooms that have an API behind
   * them, and grows as the visitor scrolls.
   */
  rooms: RoomDefinition[] = [...ROOMS];

  constructor() {
    // Filled here rather than in ngAfterViewInit. Adding doors from a
    // lifecycle hook that runs after the view is rendered changes state the
    // template has already been checked against, which Angular rightly
    // complains about.
    this.addDoors(DOORS_PER_PAGE * 2);
  }

  /** Watched by the observer; reaching it means asking for more doors. */
  @ViewChild('endOfWall') endOfWall?: ElementRef<HTMLElement>;

  private observer?: IntersectionObserver;
  private nextDoorNumber = 1;

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

  /**
   * Doors beyond the registry have no API behind them yet, so they open onto
   * an empty room. Their ids are stable, which is what lets each one keep
   * the same colour, material and face every time the page is loaded.
   */
  private addDoors(count: number): void {
    const newDoors: RoomDefinition[] = [];

    for (let i = 0; i < count; i += 1) {
      const number = this.nextDoorNumber++;
      newDoors.push({
        id: `door-${number}`,
        name: `Door ${number}`,
        component: EmptyRoomComponent,
      });
    }
    this.rooms = [...this.rooms, ...newDoors];
  }
}
