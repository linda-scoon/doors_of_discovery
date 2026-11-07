import { TestBed } from '@angular/core/testing';

import { FORTUNES, FortuneCookieRoomComponent } from './fortune-cookie-room.component';

describe('FortuneCookieRoomComponent', () => {
  it('cracks once to show a fortune and lucky numbers', () => {
    const cookie = TestBed.createComponent(FortuneCookieRoomComponent).componentInstance;
    cookie.crack();
    const fortune = cookie.fortune();
    expect(FORTUNES).toContain(fortune);
    cookie.crack();
    expect(cookie.fortune()).toBe(fortune);
    expect(cookie.numbers.every((n) => n >= 1 && n <= 49)).toBe(true);
  });
});
