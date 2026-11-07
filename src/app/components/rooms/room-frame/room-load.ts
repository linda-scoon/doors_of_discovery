import { DestroyRef, inject, signal } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

/** Where a room has got to with whatever it fetches. */
export type RoomStatus = 'loading' | 'ready' | 'failed';

/** Something a room is fetching, and how far it has got. */
export interface RoomLoad<T> {
  readonly status: () => RoomStatus;
  /** Set once the status is 'ready'. */
  readonly value: () => T | undefined;
  /** Fetches again: for a "knock again" after a failure. */
  reload(): void;
}

/**
 * Starts fetching what a room shows, and keeps track of how it went.
 *
 * Call it from a field initialiser, so it is tied to the room's lifetime:
 * a room taken down mid-fetch stops listening rather than updating a room
 * that is gone. Anything thrown while shaping the response counts as a
 * failure, so a room should throw if what came back is not usable.
 */
export function roomLoad<T>(fetch: () => Observable<T>): RoomLoad<T> {
  const status = signal<RoomStatus>('loading');
  const value = signal<T | undefined>(undefined);
  let subscription: Subscription | undefined;

  const reload = () => {
    subscription?.unsubscribe();
    status.set('loading');
    subscription = fetch().subscribe({
      next: (result) => {
        value.set(result);
        status.set('ready');
      },
      error: () => status.set('failed'),
    });
  };

  inject(DestroyRef).onDestroy(() => subscription?.unsubscribe());
  reload();

  return { status: status.asReadonly(), value: value.asReadonly(), reload };
}

/** One item from a list, chosen at random. Throws on an empty list. */
export function pickOne<T>(items: readonly T[] | undefined | null): T {
  if (!items?.length) throw new Error('Nothing to choose from');
  return items[Math.floor(Math.random() * items.length)];
}
