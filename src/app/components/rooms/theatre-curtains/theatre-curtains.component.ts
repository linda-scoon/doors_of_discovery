import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Red velvet theatre curtains, drawn back and tied either side of the
 * screen, under a scalloped pelmet with a gold trim. Drawn over whatever
 * room it is put in, which must be positioned; it takes no clicks.
 */
@Component({
  selector: 'app-theatre-curtains',
  template: `
    <span class="curtain curtain--left"></span>
    <span class="curtain curtain--right"></span>
    <span class="tieback tieback--left"></span>
    <span class="tieback tieback--right"></span>
    <span class="pelmet"></span>
  `,
  styleUrls: ['./theatre-curtains.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class TheatreCurtainsComponent {}
