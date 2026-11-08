import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { BODIES } from './planets';

/**
 * A planetarium: something in the sky -- the Sun or a planet, a moon, a
 * comet, a nebula or a galaxy -- photographed from space or by a great
 * telescope, with what to know about it. The arrows move to its
 * neighbours in the same part of the sky.
 */
@Component({
  selector: 'app-planets-room',
  imports: [RoomFrameComponent],
  template: `
    <app-room-frame status="ready">
      @let p = planet();
      <div class="planet__sky" [style.--glow]="p.colour">
        @if (!broken().has(index())) {
          <img class="planet__picture" [src]="picture()" [alt]="p.name + ', photographed from space'"
               (error)="broken.set(broken().add(index()))" />
        } @else {
          <span class="planet__stand-in" [style.background]="p.colour" role="img" [attr.aria-label]="p.name"></span>
        }
      </div>
      <p class="planet__group">{{ p.group }}</p>
      <div class="planet__travel">
        <button type="button" class="planet__step" (click)="go(-1)" [disabled]="place() === 0"
                [attr.aria-label]="'Back through ' + p.group.toLowerCase()">‹</button>
        <div>
          <p class="planet__name">{{ p.name }}</p>
          <p class="planet__kind">{{ p.kind ?? 'Planet ' + place() + ' from the Sun' }}</p>
        </div>
        <button type="button" class="planet__step" (click)="go(1)" [disabled]="place() === group().length - 1"
                [attr.aria-label]="'On through ' + p.group.toLowerCase()">›</button>
      </div>
      <dl class="planet__facts">
        @for (f of p.facts; track f[0]) {
          <dt>{{ f[0] }}</dt><dd>{{ f[1] }}</dd>
        }
      </dl>
      <p class="room-words room-words--small">{{ p.fact }}</p>
      <p class="room-credit">
        Photograph: <a [href]="'https://commons.wikimedia.org/wiki/File:' + p.file" target="_blank" rel="noopener">{{ p.credit }}</a>
      </p>
    </app-room-frame>
  `,
  styles: `
    :host { display: contents; }
    app-room-frame {
      background:
        radial-gradient(1px 1px at 12% 18%, #fff, transparent),
        radial-gradient(1px 1px at 78% 9%, #fff, transparent),
        radial-gradient(1.5px 1.5px at 88% 46%, #fff, transparent),
        radial-gradient(1px 1px at 6% 62%, #fff, transparent),
        radial-gradient(1px 1px at 52% 4%, #cfd8ff, transparent),
        radial-gradient(1px 1px at 30% 88%, #fff, transparent),
        radial-gradient(ellipse at 50% 30%, #141a3a, #03040c 70%);
      color: #e9ecff;
      gap: 3cqi;
    }
    /* A soft glow in the planet's own colour behind it. */
    .planet__sky {
      display: grid;
      place-items: center;
      width: 78cqi;
      aspect-ratio: 1;
      flex-shrink: 0;
      max-height: 40cqh;
      background: radial-gradient(circle, color-mix(in srgb, var(--glow) 30%, transparent), transparent 62%);
    }
    /* The photographs are on black, so "screen" lets the stars show round them. */
    .planet__picture {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      mix-blend-mode: screen;
      animation: arrive 500ms ease-out;
    }
    .planet__stand-in { width: 70%; aspect-ratio: 1; border-radius: 50%; box-shadow: inset -6cqi -4cqi 8cqi rgba(0, 0, 0, 0.55); }
    @keyframes arrive { from { opacity: 0; transform: scale(0.85); } }
    .planet__group { font-size: clamp(0.55rem, 3.4cqi, 0.7rem); letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.55; margin-bottom: -2cqi; }
    .planet__travel { display: flex; align-items: center; justify-content: space-between; gap: 3cqi; width: 100%; }
    .planet__name { font-size: clamp(1rem, 9cqi, 1.6rem); font-weight: 700; letter-spacing: 0.02em; }
    .planet__kind { font-size: clamp(0.58rem, 3.8cqi, 0.75rem); letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.7; }
    .planet__step {
      width: 10cqi;
      aspect-ratio: 1;
      border: 1px solid rgba(233, 236, 255, 0.4);
      border-radius: 50%;
      background: rgba(233, 236, 255, 0.08);
      color: inherit;
      font-size: 7cqi;
      line-height: 1;
      cursor: pointer;
    }
    .planet__step:disabled { opacity: 0.25; cursor: default; }
    .planet__facts {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 0.8cqi 3cqi;
      width: 100%;
      font-size: clamp(0.6rem, 4.1cqi, 0.8rem);
      text-align: left;
    }
    .planet__facts dt { opacity: 0.6; }
    .planet__facts dd { margin: 0; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanetsRoomComponent {
  readonly index = signal(Math.floor(Math.random() * BODIES.length));
  readonly planet = computed(() => BODIES[this.index()]);
  /** The bodies in the same part of the sky, as indexes, in order. */
  readonly group = computed(() =>
    BODIES.map((b, i) => (b.group === this.planet().group ? i : -1)).filter((i) => i >= 0)
  );
  readonly place = computed(() => this.group().indexOf(this.index()));
  readonly picture = computed(
    () => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(this.planet().file)}?width=640`
  );
  /** Pictures that would not load, shown as a plain globe instead. */
  readonly broken = signal(new Set<number>(), { equal: () => false });

  go(step: number): void {
    const group = this.group();
    const place = Math.min(group.length - 1, Math.max(0, this.place() + step));
    this.index.set(group[place]);
  }
}
