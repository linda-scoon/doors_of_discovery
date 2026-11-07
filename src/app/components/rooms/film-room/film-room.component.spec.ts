import { FilmRoomComponent } from './film-room.component';
import { failRequest, openRoom } from '../room-frame/room-testing';

describe('FilmRoomComponent', () => {
  it('plays an old film from the Internet Archive', async () => {
    const room = await openRoom(FilmRoomComponent);
    room.server
      .expectOne((req) => req.url === '/api/films')
      .flush({ response: { docs: [{ identifier: 'duck_and_cover', title: 'Duck and Cover', year: 1951 }] } });

    expect(room.text()).toContain('Duck and Cover');
    expect(room.text()).toContain('1951');
    expect(room.fixture.nativeElement.querySelector('iframe').src).toBe('https://archive.org/embed/duck_and_cover');
  });

  it('is bricked up when the fetch fails', async () => {
    const room = await openRoom(FilmRoomComponent);
    failRequest(room.server, /\/api\/films/);
    expect(room.bricked()).toBeTrue();
  });
});
