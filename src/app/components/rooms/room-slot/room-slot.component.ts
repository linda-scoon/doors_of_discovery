import { Component, Input, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';

import { RoomDefinition } from '../../../rooms';
import {
  DoorCharacter,
  DoorMaterial,
  Surprise,
  characterForDoor,
} from '../../doors/door/door-material';
import { DoorSoundService } from '../../../services/door-sound.service';

/**
 * A door and the room behind it.
 *
 * This owns everything the rooms would otherwise each reimplement: getting
 * past the door, the sounds it makes, and whatever it does when somebody
 * knocks. The room components are left to do one job — present whatever
 * their API returned.
 */
@Component({
  selector: 'app-room-slot',
  templateUrl: './room-slot.component.html',
  styleUrls: ['./room-slot.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class RoomSlotComponent implements OnInit {
  private readonly sound = inject(DoorSoundService);

  @Input({ required: true }) room!: RoomDefinition;

  /** This room's place along the wall. Decides its number and tag colour. */
  @Input() ordinal = 0;

  /** Whether the door stands open. */
  open = false;

  /** Set while the doorway is alight, for a door that hides fire. */
  burning = false;

  /** Set briefly when something comes out at you. */
  lunging = false;

  /** Set between a knock and the door being answered from inside. */
  answering = false;

  character!: DoorCharacter;

  contentInputs: Record<string, unknown> | undefined;

  ngOnInit(): void {
    // The registry's overrides are folded in here, not just passed to the
    // door. Without that this component would decide whether to creak from
    // the derived character while the door rendered the override, and a
    // room asking for a creaky door would have opened silently.
    const derived = characterForDoor(this.room.id, this.ordinal);

    this.character = {
      ...derived,
      material: this.room.material ?? derived.material,
      colour: this.room.colour ?? derived.colour,
      openStyle: this.room.openStyle ?? derived.openStyle,
      handleSide: this.room.handleSide ?? derived.handleSide,
    };
    this.refreshContentInputs();
  }

  /** The handle reads "Open the fact room". */
  get doorLabel(): string {
    return `the ${this.room.name.toLowerCase()}`;
  }

  get hasCurtain(): boolean {
    return this.character.hasCurtain;
  }

  /**
   * The curtain is drawn as vertical strips rather than one sheet. Each
   * strip moves on a slightly later beat than the one before it, which is
   * what makes a ripple travel across the fabric instead of the whole
   * thing swinging as a board.
   */
  readonly curtainStrips = Array.from({ length: 11 }, (_unused, i) => i);

  /**
   * Tapping a door tells you what it is made of. A few do more: some swing
   * open at a touch, and some have somebody inside who answers.
   */
  onTap(material: DoorMaterial): void {
    this.sound.tap(material);

    if (this.open) return;

    if (this.character.surprise === 'opens-on-tap') {
      this.openDoor();
      return;
    }

    if (this.character.surprise === 'answers') {
      this.answerFromInside();
    }
  }

  /**
   * A stuck door was tried. Most just shudder; a rare few knock back, which
   * is the one moment the site suggests something is in there.
   */
  onRefused(surprise: Surprise): void {
    if (surprise !== 'knocks-back') return;

    // A beat of silence first. The reply only lands once you have decided
    // the door is simply stuck.
    setTimeout(() => this.sound.knockBack(this.character.material), 700);
  }

  openDoor(): void {
    this.open = true;
    this.refreshContentInputs();

    if (this.character.openStyle === 'creak') {
      this.sound.creak();
    }
    this.reactToSurprise(this.character.surprise);
  }

  /** Everything shuts again when the pointer leaves, so the wall resets. */
  closeDoor(): void {
    this.open = false;
    this.burning = false;
    this.lunging = false;
    this.answering = false;
    this.refreshContentInputs();
  }

  /** Somebody inside calls out, waits a moment, and lets you in. */
  private answerFromInside(): void {
    if (this.answering) return;

    this.answering = true;
    this.sound.callOut('coming');

    setTimeout(() => {
      this.answering = false;
      if (!this.open) this.openDoor();
    }, 1400);
  }

  private reactToSurprise(surprise: Surprise): void {
    if (surprise === 'fire') {
      this.burning = true;
      return;
    }

    if (surprise === 'monster') {
      // Wait for the door to get out of the way first. Fired immediately it
      // is over before the door has finished swinging, which is no scare at
      // all — the whole thing happens behind a door.
      setTimeout(() => {
        this.lunging = true;
        this.sound.shriek();
        setTimeout(() => (this.lunging = false), 900);
      }, 900);
    }
  }

  private refreshContentInputs(): void {
    // Only rooms that asked for it are given the door state; passing an input
    // a component has not declared would warn at runtime.
    this.contentInputs = this.room.needsDoorState
      ? { open: this.open }
      : undefined;
  }
}
