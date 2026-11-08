import { TestBed } from '@angular/core/testing';

import { BubbleWrapRoomComponent } from './bubble-wrap-room.component';

describe('BubbleWrapRoomComponent', () => {
  it('pops each bubble once, and lays a fresh sheet', () => {
    const wrap = TestBed.createComponent(BubbleWrapRoomComponent).componentInstance;
    const all = wrap.left();
    wrap.popAt(0);
    wrap.popAt(0);
    wrap.popAt(5);
    expect(wrap.left()).toBe(all - 2);
    wrap.freshSheet();
    expect(wrap.left()).toBe(all);
  });
});
