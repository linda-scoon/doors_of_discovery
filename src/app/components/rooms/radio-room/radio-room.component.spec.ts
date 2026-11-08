import { RadioRoomComponent } from './radio-room.component';
import { failRequest, openRoom } from '../room-frame/room-testing';

const station = (name: string) => ({ name, url_resolved: `https://radio.example/${name}`, country: 'Ghana' });

describe('RadioRoomComponent', () => {
  it('tunes to a station that streams over https, and plays it with the door open', async () => {
    const room = await openRoom(RadioRoomComponent);
    room.fixture.componentRef.setInput('open', true);
    room.server
      .expectOne('/api/radio')
      .flush([{ ...station('Insecure'), url_resolved: 'http://radio.example/x' }, station('Joy')]);

    expect(room.text()).toContain('Joy');
    expect(room.text()).toContain('Ghana');
    expect(room.fixture.nativeElement.querySelector('audio').src).toContain('/Joy');
  });

  it('moves on to the next station when one will not play, and bricks up after the last', async () => {
    const room = await openRoom(RadioRoomComponent);
    room.fixture.componentRef.setInput('open', true);
    room.server.expectOne('/api/radio').flush([station('One'), station('Two')]);
    room.fixture.detectChanges();

    room.fixture.nativeElement.querySelector('audio').dispatchEvent(new Event('error'));
    expect(room.text()).toContain('Two');

    room.fixture.nativeElement.querySelector('audio').dispatchEvent(new Event('error'));
    expect(room.bricked()).toBe(true);
  });

  it('is bricked up when the fetch fails', async () => {
    const room = await openRoom(RadioRoomComponent);
    failRequest(room.server, '/api/radio');
    expect(room.bricked()).toBe(true);
  });
});
