import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { STORIES, Story } from './stories';

/** Long enough for most names, short enough to fit a doorway's lines. */
export const LONGEST_NAME = 24;

/** Where the name is kept between doors, on this device only. */
const REMEMBERED_NAME = 'web-of-doors:story-name';

/**
 * A storyteller. Asks who the hero is, then tells one of fifty adventures
 * with them in it. The name is remembered on this device, so the next story
 * room already knows who you are.
 */
@Component({
  selector: 'app-story-room',
  imports: [RoomFrameComponent],
  templateUrl: './story-room.component.html',
  styleUrls: ['./story-room.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryRoomComponent {
  readonly longestName = LONGEST_NAME;

  readonly name = signal(remembered());
  private readonly story = signal<Story | undefined>(undefined);

  /** The story with the hero's name written in, once there is one. */
  readonly told = computed(() => {
    const story = this.story();
    if (!story) return undefined;
    const fill = (text: string) => text.replaceAll('{name}', this.name());
    return { title: fill(story.title), text: fill(story.text) };
  });

  begin(typed: string): void {
    const name = tidyName(typed);
    if (!name) return;

    this.name.set(name);
    remember(name);
    this.another();
  }

  /** A different story from the one just told. */
  another(): void {
    const others = STORIES.filter((story) => story !== this.story());
    this.story.set(others[Math.floor(Math.random() * others.length)]);
  }

  /** Back to the question, to tell it about someone else. */
  someoneElse(): void {
    this.story.set(undefined);
  }
}

/** Trimmed, single-spaced, capitalised, and not too long. */
export function tidyName(typed: string): string {
  const name = typed.trim().replace(/\s+/g, ' ').slice(0, LONGEST_NAME);
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/*
 * Browser storage can be missing or refuse -- a private window, blocked
 * site data -- and a story room should still work, just without memory.
 */
function remembered(): string {
  try {
    return localStorage.getItem(REMEMBERED_NAME) ?? '';
  } catch {
    return '';
  }
}

function remember(name: string): void {
  try {
    localStorage.setItem(REMEMBERED_NAME, name);
  } catch {
    // Not remembered, then. The story is still told.
  }
}
