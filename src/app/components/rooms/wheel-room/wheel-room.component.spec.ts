import { TestBed } from '@angular/core/testing';

import { WheelRoomComponent } from './wheel-room.component';

describe('WheelRoomComponent', () => {
  it('spins forward and says win or lose once it stops where it landed', () => {
    const wheel = TestBed.createComponent(WheelRoomComponent).componentInstance;

    wheel.spin();
    expect(wheel.spinning()).toBe(true);
    expect(wheel.rotation()).toBeGreaterThan(360 * 3);

    // Where the pointer is, measured round the wheel from its top.
    const underPointer = ((360 - (wheel.rotation() % 360)) % 360) / 45;
    wheel.stopped();

    expect(wheel.result()).toBe(wheel.segments[Math.floor(underPointer)].label);
  });

  it('only ever turns one way', () => {
    const wheel = TestBed.createComponent(WheelRoomComponent).componentInstance;
    wheel.spin();
    const first = wheel.rotation();
    wheel.stopped();
    wheel.spin();

    expect(wheel.rotation()).toBeGreaterThan(first);
  });
});
