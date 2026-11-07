import { Component, Input, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';

import { RoomDefinition } from '../../../rooms';
import {
  DoorCharacter,
  DoorMaterial,
  Surprise,
  characterForDoor,
  doorLayersFor,
} from '../../doors/door/door-material';
import { DoorSoundService } from '../../../services/door-sound.service';

/** One of the doors standing between the visitor and the room. */
interface DoorLayer {
  /** Seeds this door's whole character — each layer differs. */
  id: string;
  /** 0 is the one you see first. */
  depth: number;
  character: DoorCharacter;
}

/**
 * A door and the room behind it.
 *
 * This owns everything the rooms would otherwise each reimplement: getting
 * past the door, the sounds a door makes, and whatever it does when it is
 * opened. The room components are left to do one job — present whatever
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

  /** This room's place along the wall, which decides its door's number. */
  @Input() ordinal = 0;

  /** Outermost first. Usually one; now and then two or three. */
  layers: DoorLayer[] = [];

  /** How many have been opened, counting from the outside. */
  openedCount = 0;

  /** Set while the doorway is alight, for a door that hides fire. */
  burning = false;

  /** Set briefly when something comes out at you. */
  lunging = false;

  contentInputs: Record<string, unknown> | undefined;

  ngOnInit(): void {
    const count = this.room.doorLayers ?? doorLayersFor(this.room.id);

    this.layers = Array.from({ length: count }, (_unused, depth) => {
      // The outermost keeps the plain room id, so adding a layer behind an
      // existing door does not change the door people already know.
      const id = depth === 0 ? this.room.id : `${this.room.id}:inner${depth}`;
      return { id, depth, character: characterForDoor(id) };
    });

    this.refreshContentInputs();
  }

  /** True once every door has been opened and the room is visible. */
  get roomIsOpen(): boolean {
    return this.openedCount >= this.layers.length;
  }

  isOpen(layer: DoorLayer): boolean {
    return this.openedCount > layer.depth;
  }

  /** Keeps the outermost door above the ones behind it. */
  stackingOrder(layer: DoorLayer): number {
    return this.layers.length - layer.depth;
  }

  /**
   * The handle reads "Open the fact room". Inner doors say so, because
   * opening one does not get you into the room.
   */
  doorLabel(layer: DoorLayer): string {
    const room = `the ${this.room.name.toLowerCase()}`;
    return layer.depth === 0 ? room : `the next door into ${room}`;
  }

  /** Tapping a door tells you what it is made of. */
  onTap(material: DoorMaterial): void {
    this.sound.tap(material);
  }

  /**
   * A stuck door was tried. Most just shudder; a rare few knock back, which
   * is the one moment the site suggests something is in there.
   */
  onRefused(layer: DoorLayer, surprise: Surprise): void {
    if (surprise !== 'knocks-back') return;

    // A beat of silence first. The reply is the point, and it only lands if
    // it arrives after you have decided the door is simply stuck.
    setTimeout(() => this.sound.knockBack(layer.character.material), 700);
  }

  openDoor(layer: DoorLayer): void {
    // Only the frontmost closed door can be opened; the rest are behind it.
    if (layer.depth !== this.openedCount) return;

    this.openedCount += 1;
    this.refreshContentInputs();

    if (layer.character.openStyle === 'creak') {
      this.sound.creak();
    }

    this.reactToSurprise(layer.character.surprise);
  }

  /** Everything shuts again when the pointer leaves, so the wall resets. */
  closeDoors(): void {
    this.openedCount = 0;
    this.burning = false;
    this.lunging = false;
    this.refreshContentInputs();
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
      ? { open: this.roomIsOpen }
      : undefined;
  }
}
