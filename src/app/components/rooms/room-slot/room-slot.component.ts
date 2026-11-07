import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { RoomDefinition } from '../../../rooms';

/**
 * A door and the room behind it.
 *
 * This owns the one piece of behaviour every room shares — whether its door
 * is open — so the room components do not each reimplement it. They are left
 * to do one job: present whatever their API returned.
 */
@Component({
  selector: 'app-room-slot',
  templateUrl: './room-slot.component.html',
  styleUrls: ['./room-slot.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class RoomSlotComponent implements OnInit {
  @Input({ required: true }) room!: RoomDefinition;

  open = false;

  /**
   * Inputs handed to the room's component. Rebuilt only when the door moves,
   * rather than on every change detection run, so the component is not told
   * about an input that has not actually changed.
   */
  contentInputs: Record<string, unknown> | undefined;

  ngOnInit(): void {
    this.refreshContentInputs();
  }

  /**
   * The door's button reads "Open the fact room", so the name is lowercased
   * and given an article to fit that sentence.
   */
  get doorLabel(): string {
    return `the ${this.room.name.toLowerCase()}`;
  }

  openDoor(): void {
    this.open = true;
    this.refreshContentInputs();
  }

  /** Doors close again when the pointer leaves, so the wall resets itself. */
  closeDoor(): void {
    this.open = false;
    this.refreshContentInputs();
  }

  private refreshContentInputs(): void {
    // Only rooms that asked for it are given the door state; passing an input
    // a component has not declared would warn at runtime.
    this.contentInputs = this.room.needsDoorState ? { open: this.open } : undefined;
  }
}
