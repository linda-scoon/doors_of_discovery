import { GifRoomComponent } from './gif-room.component';
import { failRequest, openRoom } from '../room-frame/room-testing';

describe('GifRoomComponent', () => {
  it('asks for one of the pages of trending gifs the server allows', async () => {
    const room = await openRoom(GifRoomComponent);
    const request = room.server.expectOne((req) => req.url === '/api/gifs');
    const offset = Number(request.request.params.get('offset'));

    expect(offset % 50).toBe(0);
    expect(offset).toBeLessThanOrEqual(450);
  });

  it('shows a gif and credits Giphy', async () => {
    const room = await openRoom(GifRoomComponent);
    room.server
      .expectOne((req) => req.url === '/api/gifs')
      .flush({ data: [{ title: 'Cat', images: { downsized: { url: 'https://media.giphy.com/cat.gif' } } }] });

    expect(room.text()).toContain('Powered by GIPHY');
    expect(room.fixture.nativeElement.querySelector('img').src).toContain('cat.gif');
  });

  it('credits whoever made the gif', async () => {
    const room = await openRoom(GifRoomComponent);
    room.server.expectOne((req) => req.url === '/api/gifs').flush({
      data: [
        {
          title: 'Cat',
          username: 'catmaker',
          user: { display_name: 'Cat Maker' },
          images: { downsized: { url: 'https://media.giphy.com/cat.gif' } },
        },
      ],
    });

    expect(room.text()).toContain('By Cat Maker');
  });

  it('is bricked up when the fetch fails', async () => {
    const room = await openRoom(GifRoomComponent);
    failRequest(room.server, /\/api\/gifs/);
    expect(room.bricked()).toBe(true);
  });
});
