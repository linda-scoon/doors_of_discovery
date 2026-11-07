import { TestBed } from '@angular/core/testing';

import { TarotRoomComponent } from './tarot-room.component';
import { TAROT_DECK } from './tarot-deck';

describe('TarotRoomComponent', () => {
  it('has the whole deck, each card with a picture and a meaning', () => {
    expect(TAROT_DECK.length).toBe(78);
    expect(new Set(TAROT_DECK.map((card) => card.file)).size).toBe(78);
    TAROT_DECK.forEach((card) => expect(card.meaning).toBeTruthy());
  });

  it('lays out a card and credits the artist', () => {
    const fixture = TestBed.createComponent(TarotRoomComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent!;

    expect(text).toContain(fixture.componentInstance.card.name);
    expect(text).toContain('Pamela Colman Smith');
  });
});
