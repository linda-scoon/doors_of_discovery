import { TestBed } from '@angular/core/testing';

import { RIDDLES, RiddleRoomComponent } from './riddle-room.component';

describe('RiddleRoomComponent', () => {
  it('keeps the answer back until asked', () => {
    const fixture = TestBed.createComponent(RiddleRoomComponent);
    fixture.detectChanges();
    const text = () => (fixture.nativeElement as HTMLElement).textContent!;
    const riddle = RIDDLES.find(([question]) => text().includes(question))!;
    expect(riddle).toBeTruthy();
    expect(text()).not.toContain(riddle[1]);

    (fixture.nativeElement.querySelector('.room-button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(text()).toContain(riddle[1]);
  });

  it('has no riddle twice', () => {
    expect(new Set(RIDDLES.map(([q]) => q)).size).toBe(RIDDLES.length);
  });
});
