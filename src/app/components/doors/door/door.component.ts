import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';

import {
  DoorCharacter,
  DoorDesign,
  DoorMaterial,
  Finish,
  OpenStyle,
  Surprise,
  Wear,
  characterForDoor,
  panelCountForDesign,
} from './door-material';

/** Which side of the door the handle is on — the hinge is on the other. */
export type HandleSide = 'left' | 'right';

export type { OpenStyle } from './door-material';

/**
 * A door.
 *
 * Almost everything about how it looks and behaves is derived from its id —
 * material, face, colour, which side the handle is on, whether it is stuck,
 * what its furniture is made of, and whether it does something unexpected.
 * Adding a door to the site means giving it an id, nothing more. Any single
 * property can still be overridden by passing it in.
 */
@Component({
  selector: 'app-door',
  templateUrl: './door.component.html',
  styleUrls: ['./door.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class DoorComponent {
  @Input()
  set id(value: string) {
    this.doorId = value;
    // Derived once per door rather than on every change detection run: the
    // template reads a dozen properties off it.
    this.character = characterForDoor(value);
  }
  get id(): string {
    return this.doorId;
  }
  private doorId = 'door';
  private character: DoorCharacter = characterForDoor('door');

  /** Whether the door stands open. */
  @Input() open: boolean = false;

  /* Overrides. Each falls back to the value derived from the id. */
  @Input() colour?: string;
  @Input() material?: DoorMaterial;
  @Input() design?: DoorDesign;
  @Input() openStyle?: OpenStyle;
  @Input() handleSide?: HandleSide;

  /**
   * What this door opens into, for screen readers — "the fact room". Read out
   * as "Open the fact room", so phrase it to follow that.
   */
  @Input() label: string = 'this room';

  /** Raised when the door is opened. Stuck doors never raise it. */
  @Output() opened = new EventEmitter<void>();

  /** Raised when someone taps the door itself, which is how it makes a sound. */
  @Output() tapped = new EventEmitter<DoorMaterial>();

  /** Raised when a stuck door is tried, so a knocking door can knock back. */
  @Output() refused = new EventEmitter<Surprise>();

  /** Set briefly when a stuck door refuses to budge, to drive the shudder. */
  refusing = false;

  /** Counts taps, so a cracking door breaks a little more each time. */
  cracks = 0;

  get resolvedMaterial(): DoorMaterial {
    return this.material ?? this.character.material;
  }

  get resolvedColour(): string {
    return this.colour ?? this.character.colour;
  }

  get resolvedDesign(): DoorDesign {
    return this.design ?? this.character.design;
  }

  get resolvedOpenStyle(): OpenStyle {
    return this.openStyle ?? this.character.openStyle;
  }

  get resolvedHandleSide(): HandleSide {
    return this.handleSide ?? this.character.handleSide;
  }

  get finish(): Finish {
    return this.character.finish;
  }

  get wear(): Wear {
    return this.character.wear;
  }

  get hasKnocker(): boolean {
    return this.character.hasKnocker;
  }

  get hasLetterbox(): boolean {
    return this.character.hasLetterbox;
  }

  get doorNumber(): number | null {
    return this.character.number;
  }

  get surprise(): Surprise {
    return this.character.surprise;
  }

  get isStuck(): boolean {
    return this.resolvedOpenStyle === 'stuck';
  }

  /** One entry per panel, for the template to repeat over. */
  get panels(): readonly number[] {
    return Array.from(
      { length: panelCountForDesign(this.resolvedDesign) },
      (_unused, index) => index
    );
  }

  /** Tapping the door is how you find out what it is made of. */
  onTap(): void {
    this.tapped.emit(this.resolvedMaterial);

    if (this.surprise === 'crack') {
      // Three taps and it is thoroughly broken; stop there.
      this.cracks = Math.min(this.cracks + 1, 3);
    }
  }

  onHandleUsed(): void {
    if (this.isStuck) {
      this.refuse();
      return;
    }
    this.opened.emit();
  }

  /** A stuck door shudders and stays shut. */
  private refuse(): void {
    if (this.refusing) return;

    this.refusing = true;
    this.refused.emit(this.surprise);
    setTimeout(() => (this.refusing = false), 420);
  }
}
