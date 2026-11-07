import { IssRoomComponent } from './iss-room.component';
import { failRequest, openRoom } from '../room-frame/room-testing';

describe('IssRoomComponent', () => {
  it('says where the station is, in degrees north or south and east or west', async () => {
    const room = await openRoom(IssRoomComponent);
    room.server
      .expectOne('/api/iss')
      .flush({ latitude: -12.34, longitude: 56.78, altitude: 419.4, velocity: 27600.2 });

    expect(room.text()).toContain('12.3°S, 56.8°E');
    expect(room.text()).toContain('419 km up');
  });

  it('is bricked up when the fetch fails', async () => {
    const room = await openRoom(IssRoomComponent);
    failRequest(room.server, '/api/iss');
    expect(room.bricked()).toBeTrue();
  });
});
