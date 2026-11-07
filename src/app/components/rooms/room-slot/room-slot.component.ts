import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';

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
/**
 * How long after the door starts moving the monster arrives.
 *
 * Short on purpose. The door it comes out of swings in 0.45s rather than
 * the usual 1.6s, so the doorway is clear by the time the monster is out
 * and the two read as one event rather than two.
 */
const MONSTER_DELAY = 150;

@Component({
  selector: 'app-room-slot',
  templateUrl: './room-slot.component.html',
  styleUrls: ['./room-slot.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class RoomSlotComponent implements OnInit, OnDestroy {
  private readonly sound = inject(DoorSoundService);

  /**
   * Everything waiting to happen on this door.
   *
   * Kept so that shutting the door can call all of it off. Without this a
   * monster fired a second after you had walked away, and lunged out
   * through a door that was shut again by then.
   */
  private pending: ReturnType<typeof setTimeout>[] = [];

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

    let openStyle = this.room.openStyle ?? derived.openStyle;

    // A door onto an empty room is never stuck. Refusing to open, and then
    // having nothing behind it, is two disappointments rather than one.
    if (this.room.isEmpty && openStyle === 'stuck') {
      openStyle = 'swing';
    }

    this.character = {
      ...derived,
      material: this.room.material ?? derived.material,
      colour: this.room.colour ?? derived.colour,
      openStyle,
      handleSide: this.room.handleSide ?? derived.handleSide,
      // The knocking surprise is what made it stuck, so it goes with it.
      surprise:
        openStyle === 'swing' && derived.surprise === 'knocks-back'
          ? 'none'
          : derived.surprise,
    };
    this.refreshContentInputs();
  }

  /** The handle reads "Open the fact room". */
  get doorLabel(): string {
    return `the ${this.room.name.toLowerCase()}`;
  }

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
    this.later(() => this.sound.knockBack(this.character.material), 700);
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
    this.cancelPending();
    this.open = false;
    this.burning = false;
    this.lunging = false;
    this.answering = false;
    this.refreshContentInputs();
  }

  ngOnDestroy(): void {
    this.cancelPending();
  }

  /**
   * Whether the room's own contents should step aside.
   *
   * A doorway with something in it is not an empty room, so it must never
   * be captioned "nothing in here yet" — not even for the moment between
   * the door opening and the monster arriving.
   */
  get upstaged(): boolean {
    return (
      this.burning ||
      this.lunging ||
      (this.open && this.character.surprise === 'monster')
    );
  }

  /** Runs something later, and remembers it so closing can call it off. */
  private later(work: () => void, delay: number): void {
    this.pending.push(setTimeout(work, delay));
  }

  private cancelPending(): void {
    this.pending.forEach(clearTimeout);
    this.pending = [];
  }

  /** Somebody inside calls out, waits a moment, and lets you in. */
  private answerFromInside(): void {
    if (this.answering) return;

    this.answering = true;
    this.sound.callOut('coming');

    this.later(() => {
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
      // Barely a beat. A monster door is given a fast swing of its own and
      // the monster comes out over the top of it while it is still moving.
      // Waiting for the door to finish meant the scare landed about a
      // second after you had stopped expecting one.
      this.later(() => {
        this.lunging = true;
        this.sound.shriek();
        this.later(() => (this.lunging = false), 900);
      }, MONSTER_DELAY);
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
