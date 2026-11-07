import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';

/** Which side of the door the handle is on — the hinge is on the other. */
export type HandleSide = 'left' | 'right';

/**
 * A door. Every room has one, and they differ only in colour and which side
 * the handle is on, so there is one component rather than one per room.
 *
 * The room's contents go inside the door's element in the room template; the
 * door sits on top of them until it is opened.
 *
 *   <app-door
 *     [open]="openedDoor"
 *     (opened)="enterRoom()"
 *     colour="#9F8170"
 *     label="the fact room">
 *   </app-door>
 */
@Component({
  selector: 'app-door',
  templateUrl: './door.component.html',
  styleUrls: ['./door.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class DoorComponent {
  /** Whether the door is standing open. The room behind is visible when it is. */
  @Input() open: boolean = false;

  /** The colour of the door itself. */
  @Input() colour: string = '';

  @Input() handleSide: HandleSide = 'right';

  /**
   * What this door opens into, for screen readers — "the fact room". Read out
   * as "Open the fact room", so phrase it to follow that.
   */
  @Input() label: string = 'this room';

  /** Raised when someone opens the door. */
  @Output() opened = new EventEmitter<void>();

  onHandleUsed(): void {
    this.opened.emit();
  }
}
