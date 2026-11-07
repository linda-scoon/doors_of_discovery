import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';

import { RoomFrameComponent } from '../room-frame/room-frame.component';

interface Flake {
  x: number;
  size: number;
  delay: number;
  seconds: number;
  drift: number;
}

/**
 * Snow that keeps falling. Calm, it drifts down slowly; just shaken, there
 * is far more of it and it whirls. Each flake starts part-way through its
 * fall, so the globe is never empty while the snow gets going.
 */
function flakes(count: number, flurry = false): Flake[] {
  return Array.from({ length: count }, () => {
    const seconds = flurry ? 1.6 + Math.random() * 1.6 : 4 + Math.random() * 4;
    return {
      x: 6 + Math.random() * 88,
      size: 0.8 + Math.random() * 1.6,
      delay: flurry ? -Math.random() * 0.4 : -Math.random() * seconds,
      seconds,
      drift: (Math.random() - 0.5) * (flurry ? 40 : 14),
    };
  });
}

/** How long the flurry lasts before the snow calms down again. */
const FLURRY_MS = 3_500;

/**
 * A snow globe with a little cottage and a tree in it. Shake it -- tap it
 * -- and the snow swirls up and drifts down again.
 */
@Component({
  selector: 'app-snow-globe-room',
  imports: [RoomFrameComponent],
  template: `
    <app-room-frame status="ready">
      <button type="button" class="globe" [class.globe--shaking]="shaking()" (click)="shake()"
              aria-label="Shake the snow globe">
        <span class="globe__glass">
          <span class="globe__ground"></span>
          <span class="globe__tree"></span>
          <span class="globe__house"><span class="globe__window"></span></span>
          @for (f of snow(); track $index) {
            <span class="globe__flake" [style.left.%]="f.x" [style.width.cqi]="f.size"
                  [style.--drift]="f.drift + 'cqi'" [style.animation-delay.s]="f.delay"
                  [style.animation-duration.s]="f.seconds"></span>
          }
        </span>
        <span class="globe__base"></span>
      </button>
      <p class="room-credit">Tap the globe to shake it</p>
    </app-room-frame>
  `,
  styles: `
    :host { display: contents; }
    app-room-frame {
      background: radial-gradient(ellipse at 50% 35%, #2b4d7a, #10203a 70%);
      color: #e6efff;
    }
    .globe { position: relative; width: 78cqi; aspect-ratio: 1 / 1.1; border: 0; background: none; cursor: pointer; }
    .globe--shaking { animation: jiggle 0.5s ease-in-out; }
    @keyframes jiggle { 25% { transform: rotate(-8deg); } 50% { transform: rotate(7deg); } 75% { transform: rotate(-4deg); } }
    .globe__glass {
      position: absolute;
      inset: 0 4% 18%;
      overflow: hidden;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.35), rgba(160, 200, 255, 0.15) 40%, rgba(30, 60, 110, 0.6));
      box-shadow: inset 0 0 4cqi rgba(255, 255, 255, 0.35);
    }
    .globe__ground { position: absolute; inset: auto -10% -10%; height: 32%; border-radius: 50%; background: #f4f8ff; }
    .globe__tree {
      position: absolute; left: 22%; bottom: 18%; width: 16cqi; height: 24cqi;
      clip-path: polygon(50% 0, 100% 75%, 62% 75%, 62% 100%, 38% 100%, 38% 75%, 0 75%);
      background: linear-gradient(#2d6a4f 75%, #6b4527 75%);
    }
    .globe__house {
      position: absolute; right: 22%; bottom: 20%; width: 22cqi; height: 16cqi;
      background: #c0392b;
      clip-path: polygon(50% 0, 100% 40%, 100% 100%, 0 100%, 0 40%);
    }
    .globe__window { position: absolute; left: 38%; bottom: 20%; width: 24%; height: 30%; background: #ffd56b; }
    .globe__flake {
      position: absolute;
      top: -4%;
      aspect-ratio: 1;
      border-radius: 50%;
      background: #ffffff;
      animation-name: fall;
      animation-timing-function: ease-in-out;
      animation-iteration-count: infinite;
    }
    @keyframes fall {
      from { transform: translate(0, 0); opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      to { transform: translate(var(--drift), 62cqi); opacity: 0; }
    }
    .globe__base {
      position: absolute; inset: auto 12% 4%; height: 18%;
      border-radius: 2cqi 2cqi 4cqi 4cqi;
      background: linear-gradient(#8a5a33, #5c3a1e);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnowGlobeRoomComponent {
  readonly snow = signal<Flake[]>(flakes(40));
  readonly shaking = signal(false);
  private calm: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.calm));
  }

  shake(): void {
    this.shaking.set(true);
    this.snow.set(flakes(90, true));
    setTimeout(() => this.shaking.set(false), 500);
    clearTimeout(this.calm);
    this.calm = setTimeout(() => this.snow.set(flakes(40)), FLURRY_MS);
  }
}
