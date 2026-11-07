import { FactRoomComponent } from './fact-room.component';
import { failRequest, openRoom } from '../room-frame/room-testing';

describe('FactRoomComponent', () => {
  it('shows the fact it was sent', async () => {
    const room = await openRoom(FactRoomComponent);
    room.server.expectOne('/api/facts').flush({ text: 'Bananas are berries.' });
    expect(room.text()).toContain('Bananas are berries.');
  });

  it('says nobody is answering when the fetch fails', async () => {
    const room = await openRoom(FactRoomComponent);
    failRequest(room.server, '/api/facts');
    expect(room.text()).toContain("Nobody's answering");
  });

  it('treats an empty fact as a failure, not an empty room', async () => {
    const room = await openRoom(FactRoomComponent);
    room.server.expectOne('/api/facts').flush({ text: '  ' });
    expect(room.text()).toContain("Nobody's answering");
  });
});
