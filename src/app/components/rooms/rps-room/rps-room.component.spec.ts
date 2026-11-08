import { outcome } from './rps-room.component';

describe('rock, paper, scissors', () => {
  it('knows who wins', () => {
    expect(outcome('rock', 'scissors')).toBe('win');
    expect(outcome('scissors', 'paper')).toBe('win');
    expect(outcome('paper', 'rock')).toBe('win');
    expect(outcome('rock', 'paper')).toBe('lose');
    expect(outcome('paper', 'paper')).toBe('draw');
  });
});
