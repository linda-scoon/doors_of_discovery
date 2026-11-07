import { TestBed } from '@angular/core/testing';

import { ChallengeRoomComponent } from './challenge-room.component';
import { CHALLENGES } from './challenges';

describe('ChallengeRoomComponent', () => {
  it('sets a challenge, cheers when it is done, and offers another', () => {
    const room = TestBed.createComponent(ChallengeRoomComponent).componentInstance;
    expect([...CHALLENGES.day, ...CHALLENGES.hour]).toContain(room.current().challenge);
    room.finish();
    expect(room.done()).toBe(true);
    room.another();
    expect(room.done()).toBe(false);
  });

  it('has nothing in it that could do harm', () => {
    const risky = /fast(ing)?\b|skip (a )?meal|diet|calorie|alcohol|drink(ing)? (beer|wine)|dare|money|spend money|buy|stranger|ice bath|hold your breath/i;
    for (const challenge of [...CHALLENGES.day, ...CHALLENGES.hour]) expect(challenge).not.toMatch(risky);
  });
});
