import { QoutesRoomComponent } from './qoutes-room.component';
import { failRequest, openRoom } from '../room-frame/room-testing';

describe('QoutesRoomComponent', () => {
  it('shows a quote and who said it, and credits ZenQuotes', async () => {
    const room = await openRoom(QoutesRoomComponent);
    room.server.expectOne('/api/quotes').flush([{ q: 'Be here now.', a: 'Ram Dass' }]);

    expect(room.text()).toContain('Be here now.');
    expect(room.text()).toContain('Ram Dass');
    expect(room.text()).toContain('ZenQuotes');
  });

  it('does not pass off a rate-limit notice as a quote', async () => {
    const room = await openRoom(QoutesRoomComponent);
    room.server
      .expectOne('/api/quotes')
      .flush([{ q: 'Too many requests. Obtain an auth key.', a: 'zenquotes.io' }]);

    expect(room.bricked()).toBe(true);
  });

  it('is bricked up when the fetch fails', async () => {
    const room = await openRoom(QoutesRoomComponent);
    failRequest(room.server, '/api/quotes');
    expect(room.bricked()).toBe(true);
  });
});
