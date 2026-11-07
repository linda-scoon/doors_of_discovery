import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ROOMS } from './rooms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class AppComponent {
  title: string = 'web_of_doors';

  /** The doors to show, in order. Add one in rooms.ts. */
  readonly rooms = ROOMS;
}
