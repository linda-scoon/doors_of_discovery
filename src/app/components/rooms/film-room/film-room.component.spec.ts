import { FilmRoomComponent } from './film-room.component';
import { failRequest, openRoom } from '../room-frame/room-testing';

describe('FilmRoomComponent', () => {
  it('plays an old film from the Internet Archive as soon as the door is open', async () => {
    const room = await openRoom(FilmRoomComponent);
    room.fixture.componentRef.setInput('open', true);
    room.server
      .expectOne((req) => req.url === '/api/films')
      .flush({ response: { docs: [{ identifier: 'duck_and_cover', title: 'Duck and Cover', year: 1951 }] } });

    expect(room.text()).toContain('Duck and Cover');
    expect(room.text()).toContain('1951');
    expect(room.fixture.nativeElement.querySelector('iframe').src).toBe(
      'https://archive.org/embed/duck_and_cover?autoplay=1'
    );
  });

  it('stops the film the moment the door starts to close', async () => {
    const room = await openRoom(FilmRoomComponent);
    room.fixture.componentRef.setInput('open', true);
    room.server
      .expectOne((req) => req.url === '/api/films')
      .flush({ response: { docs: [{ identifier: 'duck_and_cover', title: 'Duck and Cover' }] } });
    room.fixture.detectChanges();

    room.fixture.componentRef.setInput('open', false);
    room.fixture.detectChanges();

    expect(room.fixture.nativeElement.querySelector('iframe')).toBeNull();
  });

  it('is bricked up when the fetch fails', async () => {
    const room = await openRoom(FilmRoomComponent);
    failRequest(room.server, /\/api\/films/);
    expect(room.bricked()).toBeTrue();
  });
});
