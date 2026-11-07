import { TriviaRoomComponent } from './trivia-room.component';
import { failRequest, openRoom } from '../room-frame/room-testing';

const question = {
  category: 'Science%20%26%20Nature',
  question: 'What%20is%20H2O%3F',
  correct_answer: 'Water',
  incorrect_answers: ['Salt', 'Air', 'Fire'],
};

describe('TriviaRoomComponent', () => {
  it('asks the question, decoded, with all four answers and the category', async () => {
    const room = await openRoom(TriviaRoomComponent);
    room.server.expectOne('/api/trivia').flush({ results: [question] });

    expect(room.text()).toContain('What is H2O?');
    expect(room.text()).toContain('Science & Nature');
    expect(room.fixture.nativeElement.querySelectorAll('button').length).toBe(4);
  });

  it('says whether the answer tapped was right, and shows the right one', async () => {
    const room = await openRoom(TriviaRoomComponent);
    room.server.expectOne('/api/trivia').flush({ results: [question] });
    room.fixture.detectChanges();

    const buttons: HTMLButtonElement[] = [...room.fixture.nativeElement.querySelectorAll('button')];
    buttons.find((b) => b.textContent!.trim() === 'Salt')!.click();

    expect(room.text()).toContain('Not quite.');
    const right = buttons.find((b) => b.textContent!.trim() === 'Water')!;
    room.fixture.detectChanges();
    expect(right.classList).toContain('trivia-room__choice--right');
  });

  it('is bricked up when the fetch fails', async () => {
    const room = await openRoom(TriviaRoomComponent);
    failRequest(room.server, '/api/trivia');
    expect(room.bricked()).toBeTrue();
  });
});
