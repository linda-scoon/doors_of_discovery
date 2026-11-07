import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * A stretch of brick wall.
 *
 * Two places use it. Some cells of the wall have no door at all, just
 * bricks, so the doors are set into a wall rather than tiled edge to edge.
 * And a room whose source is down is bricked up: the door still opens, but
 * there is only wall behind it -- which reads as part of the place rather
 * than as an error.
 */
@Component({
  selector: 'app-bricks',
  template: `@if (label()) {<span class="bricks__label">{{ label() }}</span>}`,
  styleUrls: ['./bricks.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.bricks--doorway]': 'doorway()',
    '[attr.aria-hidden]': 'label() ? null : "true"',
  },
})
export class BricksComponent {
  /** Set inside a doorway, where the bricks are set back and in shadow. */
  readonly doorway = input(false);

  /** Read out by screen readers, which cannot see the bricks. */
  readonly label = input<string>();
}
