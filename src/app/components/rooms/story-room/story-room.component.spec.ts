import { TestBed } from '@angular/core/testing';

import { StoryRoomComponent, tidyName } from './story-room.component';
import { STORIES } from './stories';

describe('StoryRoomComponent', () => {
  beforeEach(() => localStorage.removeItem('web-of-doors:story-name'));

  function open() {
    const fixture = TestBed.createComponent(StoryRoomComponent);
    fixture.detectChanges();
    const text = () => {
      fixture.detectChanges();
      return (fixture.nativeElement as HTMLElement).textContent!.replace(/\s+/g, ' ');
    };
    return { fixture, room: fixture.componentInstance, text };
  }

  it('has fifty stories, every one with a part for the hero', () => {
    expect(STORIES.length).toBe(50);
    STORIES.forEach((story) => expect(story.text).toContain('{name}'));
  });

  it('asks for a name, then tells a story with it written in', () => {
    const { room, text } = open();
    expect(text()).toContain('Who is the hero of this story?');

    room.begin('  ada  ');

    expect(text()).toContain('Ada');
    expect(text()).not.toContain('{name}');
  });

  it('does not start without a name', () => {
    const { room, text } = open();
    room.begin('   ');
    expect(text()).toContain('Who is the hero of this story?');
  });

  it('tells a different story when asked for another', () => {
    const { room } = open();
    room.begin('Ada');
    const first = room.told()!.text;

    room.another();

    expect(room.told()!.text).not.toBe(first);
  });

  it('remembers the name for the next story room', () => {
    open().room.begin('Ada');
    expect(open().room.name()).toBe('Ada');
  });

  it('tidies a name: trimmed, capitalised, not too long', () => {
    expect(tidyName('  lin   da ')).toBe('Lin da');
    expect(tidyName('x'.repeat(40)).length).toBe(24);
  });
});
