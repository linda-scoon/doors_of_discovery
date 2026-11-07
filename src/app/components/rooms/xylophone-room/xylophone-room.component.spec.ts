import { TestBed } from '@angular/core/testing';

import { XylophoneRoomComponent } from './xylophone-room.component';

describe('XylophoneRoomComponent', () => {
  it('has eight bars, lowest note first, and lights the one struck', async () => {
    const room = TestBed.createComponent(XylophoneRoomComponent).componentInstance;
    expect(room.bars.length).toBe(8);
    const frequencies = room.bars.map((b) => b.frequency);
    expect([...frequencies].sort((a, b) => a - b)).toEqual(frequencies);

    room.strike(3);
    await Promise.resolve();
    expect(room.struck()).toBe(3);
  });
});
