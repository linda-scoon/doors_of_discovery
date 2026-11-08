import { PhotoRoomComponent } from './photo-room.component';
import { failRequest, openRoom } from '../room-frame/room-testing';

describe('PhotoRoomComponent', () => {
  it('shows a photo and credits the photographer and Pexels, with links', async () => {
    const room = await openRoom(PhotoRoomComponent);
    room.server.expectOne((req) => req.url === '/api/photos').flush({
      photos: [
        {
          url: 'https://www.pexels.com/photo/1/',
          alt: 'A red door',
          photographer: 'Ama Mensah',
          photographer_url: 'https://www.pexels.com/@ama',
          src: { portrait: 'https://images.pexels.com/1.jpg' },
        },
      ],
    });

    expect(room.text()).toContain('Photo by Ama Mensah on Pexels');
    const links = [...room.fixture.nativeElement.querySelectorAll('a')].map((a: HTMLAnchorElement) => a.href);
    expect(links).toContain('https://www.pexels.com/@ama');
    expect(links).toContain('https://www.pexels.com/photo/1/');
  });

  it('is bricked up when the fetch fails, as it is until the key is set', async () => {
    const room = await openRoom(PhotoRoomComponent);
    failRequest(room.server, /\/api\/photos/);
    expect(room.bricked()).toBe(true);
  });
});
