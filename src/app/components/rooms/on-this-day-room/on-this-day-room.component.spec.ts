import { OnThisDayRoomComponent } from './on-this-day-room.component';
import { failRequest, openRoom } from '../room-frame/room-testing';

describe('OnThisDayRoomComponent', () => {
  it("asks for the visitor's own date, and shows what happened", async () => {
    const room = await openRoom(OnThisDayRoomComponent);
    const today = new Date();
    const url = `/api/onthisday/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

    room.server.expectOne(url).flush({ events: [{ year: 1969, text: 'Something happened.' }] });

    expect(room.text()).toContain('1969');
    expect(room.text()).toContain('Something happened.');
  });

  it('is bricked up when the fetch fails', async () => {
    const room = await openRoom(OnThisDayRoomComponent);
    failRequest(room.server, /\/api\/onthisday\//);
    expect(room.bricked()).toBeTrue();
  });
});
