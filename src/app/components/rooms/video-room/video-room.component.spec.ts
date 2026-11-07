import { VideoRoomComponent } from './video-room.component';
import { failRequest, openRoom } from '../room-frame/room-testing';

describe('VideoRoomComponent', () => {
  it('plays the trailer of a popular film as soon as the door is open', async () => {
    const room = await openRoom(VideoRoomComponent);
    room.fixture.componentRef.setInput('open', true);
    room.server.expectOne('/api/videos/popular').flush({ results: [{ id: 7, title: 'A Film' }] });
    room.server.expectOne('/api/videos/trailer/7').flush({
      results: [
        { key: 'clip', site: 'YouTube', type: 'Clip' },
        { key: 'trail', site: 'YouTube', type: 'Trailer' },
      ],
    });

    expect(room.text()).toContain('A Film');
    const src = room.fixture.nativeElement.querySelector('iframe').src;
    expect(src).toContain('/embed/trail');
    expect(src).toContain('autoplay=1');
  });

  it('is bricked up when the film has nothing on YouTube', async () => {
    const room = await openRoom(VideoRoomComponent);
    room.server.expectOne('/api/videos/popular').flush({ results: [{ id: 7, title: 'A Film' }] });
    room.server.expectOne('/api/videos/trailer/7').flush({ results: [{ key: 'x', site: 'Vimeo', type: 'Trailer' }] });

    expect(room.bricked()).toBeTrue();
  });

  it('is bricked up when the fetch fails', async () => {
    const room = await openRoom(VideoRoomComponent);
    failRequest(room.server, '/api/videos/popular');
    expect(room.bricked()).toBeTrue();
  });
});
