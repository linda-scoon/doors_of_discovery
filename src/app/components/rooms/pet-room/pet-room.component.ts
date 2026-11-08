import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { PetSounds } from './pet-sounds';

export type Mood = 'content' | 'purring' | 'surprised' | 'grumpy' | 'eating' | 'happy' | 'full';

export interface Food {
  id: number;
  emoji: string;
  name: string;
  /** Where it sits on the rug, as a share of the room's width. */
  home: number;
  /** How far it has been dragged from home, in pixels. */
  dx: number;
  dy: number;
  dragging: boolean;
  eaten: boolean;
}

interface Heart {
  id: number;
  /** Across the pet, as a percentage. */
  x: number;
}

/** What Pip says for each mood. */
const SAYS: Record<Mood, string> = {
  content: 'Pip is pleased to see you.',
  purring: 'Purrrrr…',
  surprised: 'Chirp!',
  grumpy: 'Hey! Stop poking!',
  eating: 'Nom nom nom…',
  happy: 'Yum! Pip loves you.',
  full: 'Pip is full, and very happy.',
};

/** Pokes close enough together to count as pestering. */
const POKES_TO_GRUMPY = 4;
const POKE_MEMORY_MS = 2_500;
/** How far a press must travel to be a stroke rather than a poke. */
const STROKE_DISTANCE = 30;

/**
 * A playroom with Pip in it, a baby cheetah: stroke Pip and it purrs, poke
 * it and it chirps -- as cheetah cubs do -- too often and it sulks, and drag
 * a snack to it and it eats and is happy. Pip and its noises are this
 * site's own.
 */
@Component({
  selector: 'app-pet-room',
  imports: [RoomFrameComponent],
  templateUrl: './pet-room.component.html',
  styleUrls: ['./pet-room.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetRoomComponent {
  private readonly sounds = new PetSounds();
  private readonly timers = new Set<ReturnType<typeof setTimeout>>();

  readonly mood = signal<Mood>('content');
  readonly says = computed(() => SAYS[this.mood()]);
  readonly hearts = signal<Heart[]>([]);
  readonly foods = signal<Food[]>([
    { id: 1, emoji: '🍖', name: 'some meat', home: 20, dx: 0, dy: 0, dragging: false, eaten: false },
    { id: 2, emoji: '🐟', name: 'a fish', home: 50, dx: 0, dy: 0, dragging: false, eaten: false },
    { id: 3, emoji: '🥛', name: 'some milk', home: 80, dx: 0, dy: 0, dragging: false, eaten: false },
  ]);

  private readonly pet = viewChild<ElementRef<SVGElement>>('pet');
  private press?: { x: number; y: number; at: number; travelled: number; stroking: boolean };
  private pokes: number[] = [];
  private nextHeart = 1;
  private drag?: { id: number; x: number; y: number };

  constructor() {
    inject(DestroyRef).onDestroy(() => this.timers.forEach(clearTimeout));
  }

  /* ---------------------------------------------------------- touching Pip */

  onPetDown(event: PointerEvent): void {
    (event.currentTarget as Element).setPointerCapture?.(event.pointerId);
    this.press = { x: event.clientX, y: event.clientY, at: Date.now(), travelled: 0, stroking: false };
  }

  onPetMove(event: PointerEvent): void {
    if (!this.press) return;
    this.press.travelled += Math.hypot(event.clientX - this.press.x, event.clientY - this.press.y);
    this.press.x = event.clientX;
    this.press.y = event.clientY;

    if (!this.press.stroking && this.press.travelled > STROKE_DISTANCE) {
      this.press.stroking = true;
      this.stroke();
    }
    // Another heart every so often while the stroking goes on.
    if (this.press.stroking && this.press.travelled > STROKE_DISTANCE * 4) {
      this.press.travelled = STROKE_DISTANCE;
      this.addHeart();
    }
  }

  onPetUp(): void {
    const press = this.press;
    this.press = undefined;
    if (press && !press.stroking) this.poke();
  }

  /** Stroked: eyes shut, purring, a heart or two. */
  stroke(): void {
    if (this.mood() === 'eating') return;
    this.pokes = [];
    this.mood.set('purring');
    this.addHeart();
    this.sounds.purr();
    this.settleIn(1_600);
  }

  /** Poked: a chirp -- and a sulk, if it keeps happening. */
  poke(): void {
    if (this.mood() === 'eating') return;
    const now = Date.now();
    this.pokes = [...this.pokes.filter((at) => now - at < POKE_MEMORY_MS), now];

    if (this.pokes.length >= POKES_TO_GRUMPY) {
      this.mood.set('grumpy');
      this.sounds.grumble();
      this.settleIn(2_200);
    } else {
      this.mood.set('surprised');
      this.sounds.chirp();
      this.settleIn(700);
    }
  }

  /* -------------------------------------------------------------- feeding */

  onFoodDown(event: PointerEvent, food: Food): void {
    if (food.eaten) return;
    (event.currentTarget as Element).setPointerCapture?.(event.pointerId);
    this.drag = { id: food.id, x: event.clientX - food.dx, y: event.clientY - food.dy };
    this.updateFood(food.id, { dragging: true });
  }

  onFoodMove(event: PointerEvent, food: Food): void {
    if (this.drag?.id !== food.id) return;
    this.updateFood(food.id, { dx: event.clientX - this.drag.x, dy: event.clientY - this.drag.y });
  }

  onFoodUp(event: PointerEvent, food: Food): void {
    if (this.drag?.id !== food.id) return;
    this.drag = undefined;

    const pet = this.pet()?.nativeElement.getBoundingClientRect();
    const dropped =
      pet &&
      event.clientX >= pet.left &&
      event.clientX <= pet.right &&
      event.clientY >= pet.top &&
      event.clientY <= pet.bottom;

    if (dropped) {
      this.feed(food);
    } else {
      // Not given to Pip: back to its place on the rug.
      this.updateFood(food.id, { dragging: false, dx: 0, dy: 0 });
    }
  }

  /**
   * Given something to eat: munching, then very happy. What is eaten is
   * gone until the door is opened again -- the room is laid out afresh
   * each time -- and once everything is eaten, Pip is full.
   */
  feed(food: Food): void {
    this.updateFood(food.id, { dragging: false, eaten: true, dx: 0, dy: 0 });
    this.pokes = [];
    this.mood.set('eating');
    this.sounds.munch();

    this.later(() => {
      const allEaten = this.foods().every((f) => f.eaten);
      this.mood.set(allEaten ? 'full' : 'happy');
      this.addHeart();
      this.addHeart();
      if (!allEaten) this.settleIn(2_000);
    }, 900);
  }

  /* --------------------------------------------------------------- helpers */

  private updateFood(id: number, change: Partial<Food>): void {
    this.foods.update((foods) => foods.map((f) => (f.id === id ? { ...f, ...change } : f)));
  }

  private addHeart(): void {
    const heart = { id: this.nextHeart++, x: 30 + Math.random() * 40 };
    this.hearts.update((hearts) => [...hearts, heart]);
    this.later(() => this.hearts.update((hearts) => hearts.filter((h) => h !== heart)), 1_400);
  }

  /** Back to content after a while, unless something else has happened. */
  private settleIn(ms: number): void {
    const mood = this.mood();
    this.later(() => {
      if (this.mood() === mood) this.mood.set('content');
    }, ms);
  }

  private later(work: () => void, ms: number): void {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      work();
    }, ms);
    this.timers.add(timer);
  }
}
