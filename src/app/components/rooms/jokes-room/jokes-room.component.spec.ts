import { JokesRoomComponent } from './jokes-room.component';
import { failRequest, openRoom } from '../room-frame/room-testing';

describe('JokesRoomComponent', () => {
  it('shows a setup and its punchline', async () => {
    const room = await openRoom(JokesRoomComponent);
    room.server
      .expectOne('/api/jokes')
      .flush({ type: 'twopart', setup: 'Why the long face?', delivery: 'I am a horse.' });

    expect(room.text()).toContain('Why the long face?');
    expect(room.text()).toContain('I am a horse.');
  });

  it('shows a one-liner, which used to come out blank', async () => {
    const room = await openRoom(JokesRoomComponent);
    room.server.expectOne('/api/jokes').flush({ type: 'single', joke: 'I used to be indecisive.' });

    expect(room.text()).toContain('I used to be indecisive.');
  });

  it('says nobody is answering when the fetch fails', async () => {
    const room = await openRoom(JokesRoomComponent);
    failRequest(room.server, '/api/jokes');
    expect(room.text()).toContain("Nobody's answering");
  });
});
