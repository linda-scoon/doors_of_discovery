import { FactRoomComponent } from './fact-room.component';
import { failRequest, openRoom } from '../room-frame/room-testing';

describe('FactRoomComponent', () => {
  it('shows the fact it was sent', async () => {
    const room = await openRoom(FactRoomComponent);
    room.server.expectOne('/api/facts').flush({ text: 'Bananas are berries.' });
    expect(room.text()).toContain('Bananas are berries.');
  });

  it('credits where the fact came from', async () => {
    const room = await openRoom(FactRoomComponent);
    room.server
      .expectOne('/api/facts')
      .flush({ text: 'Bananas are berries.', source: 'fruit.example', source_url: 'https://fruit.example/' });

    expect(room.text()).toContain('Source: fruit.example');
    expect(room.text()).toContain('Useless Facts');
  });

  it('is bricked up when the fetch fails', async () => {
    const room = await openRoom(FactRoomComponent);
    failRequest(room.server, '/api/facts');
    expect(room.bricked()).toBeTrue();
  });

  it('treats an empty fact as a failure, not an empty room', async () => {
    const room = await openRoom(FactRoomComponent);
    room.server.expectOne('/api/facts').flush({ text: '  ' });
    expect(room.bricked()).toBeTrue();
  });
});
