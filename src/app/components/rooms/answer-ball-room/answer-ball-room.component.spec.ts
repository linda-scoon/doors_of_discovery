import { TestBed } from '@angular/core/testing';

import { AnswerBallRoomComponent } from './answer-ball-room.component';

describe('AnswerBallRoomComponent', () => {
  it('shakes, then answers', () => {
    vi.useFakeTimers();
    try {
      const ball = TestBed.createComponent(AnswerBallRoomComponent).componentInstance;
      ball.shake();
      expect(ball.shaking()).toBe(true);
      expect(ball.answer()).toBeUndefined();
      vi.advanceTimersByTime(600);
      expect(ball.shaking()).toBe(false);
      expect(ball.answer()).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });
});
