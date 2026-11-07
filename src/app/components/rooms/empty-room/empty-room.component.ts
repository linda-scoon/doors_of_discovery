import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * A room nobody has put anything in yet.
 *
 * The wall of doors is endless, but there are only so many APIs wired up, so
 * most doors open onto this. It is deliberately almost empty: an unfurnished
 * room is a better answer than a door that will not open, and it leaves
 * somewhere obvious to put the next API.
 */
@Component({
  selector: 'app-empty-room',
  templateUrl: './empty-room.component.html',
  styleUrls: ['./empty-room.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class EmptyRoomComponent {}
