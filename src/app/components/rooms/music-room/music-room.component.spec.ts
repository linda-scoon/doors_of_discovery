import { MusicRoomComponent } from './music-room.component';
import { failRequest, openRoom } from '../room-frame/room-testing';

const track = {
  title: 'A Song',
  preview: 'https://example.com/preview.mp3',
  artist: { name: 'A Band' },
  album: { cover_medium: 'https://example.com/cover.jpg', title: 'An Album' },
};

describe('MusicRoomComponent', () => {
  it('shows the track and plays it while the door is open', async () => {
    const room = await openRoom(MusicRoomComponent);
    room.fixture.componentRef.setInput('open', true);
    room.server.expectOne('/api/music').flush({ data: [track] });

    expect(room.text()).toContain('A Song');
    expect(room.text()).toContain('A Band');
    expect(room.fixture.nativeElement.querySelector('audio')).toBeTruthy();
  });

  it('is silent once the door is closing', async () => {
    const room = await openRoom(MusicRoomComponent);
    room.server.expectOne('/api/music').flush({ data: [track] });
    room.fixture.componentRef.setInput('open', false);
    room.fixture.detectChanges();

    expect(room.fixture.nativeElement.querySelector('audio')).toBeNull();
  });

  it('is bricked up when the fetch fails', async () => {
    const room = await openRoom(MusicRoomComponent);
    failRequest(room.server, '/api/music');
    expect(room.bricked()).toBeTrue();
  });
});
