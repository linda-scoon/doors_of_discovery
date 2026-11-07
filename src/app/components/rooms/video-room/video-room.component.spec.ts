import { VideoRoomComponent } from './video-room.component';
import { failRequest, openRoom } from '../room-frame/room-testing';

describe('VideoRoomComponent', () => {
  it('shows the trailer of a popular film', async () => {
    const room = await openRoom(VideoRoomComponent);
    room.server.expectOne('/api/videos/popular').flush({ results: [{ id: 7, title: 'A Film' }] });
    room.server.expectOne('/api/videos/trailer/7').flush({
      results: [
        { key: 'clip', site: 'YouTube', type: 'Clip' },
        { key: 'trail', site: 'YouTube', type: 'Trailer' },
      ],
    });

    expect(room.text()).toContain('A Film');
    expect(room.fixture.nativeElement.querySelector('iframe').src).toContain('/embed/trail');
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
