import { LiveRoomComponent, LiveStream, alternate } from './live-room.component';
import { failRequest, openRoom } from '../room-frame/room-testing';

const stream = (id: string, topic: string): LiveStream => ({ id: id.padEnd(11, 'x'), title: `Live ${id}`, channel: 'NASA', topic });

describe('LiveRoomComponent', () => {
  it('plays a live stream only once the door is open, muted, from no-cookie YouTube', async () => {
    const room = await openRoom(LiveRoomComponent);
    room.server.expectOne('/api/live').flush({ streams: [stream('earth', 'space')] });
    expect(room.text()).toContain('Live earth');
    expect(room.fixture.nativeElement.querySelector('iframe')).toBeNull();

    room.fixture.componentRef.setInput('open', true);
    room.fixture.detectChanges();
    const iframe = room.fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement;
    expect(iframe.src).toBe('https://www.youtube-nocookie.com/embed/earthxxxxxx?autoplay=1&mute=1&playsinline=1&rel=0');
  });

  it('refuses a stream id that is not one', async () => {
    const room = await openRoom(LiveRoomComponent);
    room.server.expectOne('/api/live').flush({ streams: [{ id: 'x" onload="alert(1)', title: 't', channel: 'c', topic: 's' }] });
    expect(room.bricked()).toBe(true);
  });

  it('moves on to another view', async () => {
    const room = await openRoom(LiveRoomComponent);
    room.server.expectOne('/api/live').flush({ streams: [stream('one', 'space'), stream('two', 'ocean')] });
    const first = room.fixture.componentInstance.current()!.id;
    room.fixture.componentInstance.another();
    expect(room.fixture.componentInstance.current()!.id).not.toBe(first);
  });

  it('is bricked up when nothing is live', async () => {
    const room = await openRoom(LiveRoomComponent);
    failRequest(room.server, '/api/live');
    expect(room.bricked()).toBe(true);
  });

  it('keeps the same kind of view from coming twice in a row where it can', () => {
    const ordered = alternate([stream('a', 'space'), stream('b', 'space'), stream('c', 'ocean'), stream('d', 'ocean')]);
    for (let i = 1; i < ordered.length; i += 1) expect(ordered[i].topic).not.toBe(ordered[i - 1].topic);
  });
});
