import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';

/** Which side of the door this handle sits on. */
export type HandleSide = 'left' | 'right';

/**
 * The handle on a door: a lever, a keyhole, and the thing you actually click.
 *
 * It is a <button> rather than a styled <div> so that it can be reached with
 * the keyboard and announced by a screen reader. Doors that can only be
 * opened with a mouse are not openable by everyone.
 */
@Component({
  selector: 'app-handle',
  templateUrl: './handle.component.html',
  styleUrls: ['./handle.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class HandleComponent {
  @Input() side: HandleSide = 'right';

  /** Whether the lever is pushed down, which it stays while the door is open. */
  @Input() pressed: boolean = false;

  /** What the door opens into, used to build the button's accessible name. */
  @Input() label: string = 'this room';

  /** Raised when the handle is used, by click or by keyboard. */
  @Output() used = new EventEmitter<void>();

  onClick(): void {
    this.used.emit();
  }
}
