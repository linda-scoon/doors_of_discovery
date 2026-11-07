import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { pop } from '../room-frame/tones';

/** Kept in step with the grid in the styles below. */
const COLUMNS = 6;
const ROWS = 9;

/**
 * A sheet of bubble wrap. Tap a bubble to pop it, or drag across the sheet
 * to pop a whole row. When it is all popped, there is a fresh sheet.
 */
@Component({
  selector: 'app-bubble-wrap-room',
  imports: [RoomFrameComponent],
  template: `
    <app-room-frame status="ready">
      <p class="room-words room-words--small">{{ left() ? left() + ' bubbles to pop' : 'All popped!' }}</p>
      <div class="wrap" (pointerdown)="pressing = true" (pointerup)="pressing = false"
           (pointerleave)="pressing = false">
        @for (popped of bubbles(); track $index) {
          <button type="button" class="bubble" [class.bubble--popped]="popped"
                  [attr.aria-label]="popped ? 'Popped' : 'Pop this bubble'" [disabled]="popped"
                  (pointerdown)="popAt($index)" (pointerenter)="pressing && popAt($index)"></button>
        }
      </div>
      @if (!left()) {
        <button type="button" class="room-button" (click)="freshSheet()">A fresh sheet</button>
      }
    </app-room-frame>
  `,
  styles: `
    :host { display: contents; }
    app-room-frame {
      background: linear-gradient(160deg, #e9f3ff, #d5e6f7);
      color: #24425f;
    }
    .wrap {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 1.6cqi;
      width: 100%;
      padding: 3cqi;
      border-radius: 2cqi;
      background: rgba(255, 255, 255, 0.55);
      box-shadow: 0 1cqi 3cqi rgba(36, 66, 95, 0.2);
      touch-action: none;
    }
    .bubble {
      aspect-ratio: 1;
      border: 1px solid rgba(255, 255, 255, 0.9);
      border-radius: 50%;
      background: radial-gradient(circle at 32% 28%, #ffffff 0 14%, rgba(190, 220, 245, 0.75) 40%, rgba(150, 190, 225, 0.6));
      box-shadow: 0 0.6cqi 1cqi rgba(36, 66, 95, 0.25);
      cursor: pointer;
      transition: transform 120ms ease;
    }
    .bubble--popped {
      transform: scale(0.82);
      background: radial-gradient(circle, rgba(200, 220, 240, 0.4), rgba(170, 200, 230, 0.25));
      box-shadow: none;
      cursor: default;
      clip-path: polygon(10% 30%, 30% 5%, 60% 15%, 95% 10%, 85% 45%, 100% 80%, 60% 95%, 25% 90%, 5% 65%);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BubbleWrapRoomComponent {
  readonly bubbles = signal<boolean[]>(Array(COLUMNS * ROWS).fill(false));
  readonly left = computed(() => this.bubbles().filter((popped) => !popped).length);
  pressing = false;

  popAt(index: number): void {
    if (this.bubbles()[index]) return;
    this.bubbles.update((all) => all.map((popped, i) => popped || i === index));
    pop(0.8 + Math.random() * 0.5);
  }

  freshSheet(): void {
    this.bubbles.set(Array(COLUMNS * ROWS).fill(false));
  }
}
