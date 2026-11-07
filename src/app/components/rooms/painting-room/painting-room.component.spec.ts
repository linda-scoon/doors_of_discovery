import { PaintingRoomComponent } from './painting-room.component';
import { failRequest, openRoom } from '../room-frame/room-testing';

describe('PaintingRoomComponent', () => {
  it('asks for a page in the range the server allows', async () => {
    const room = await openRoom(PaintingRoomComponent);
    const request = room.server.expectOne((req) => req.url === '/api/paintings');
    const page = Number(request.request.params.get('page'));

    expect(page).toBeGreaterThanOrEqual(1);
    expect(page).toBeLessThanOrEqual(50);
  });

  it('hangs a painting that has an image, with its title and artist', async () => {
    const room = await openRoom(PaintingRoomComponent);
    room.server.expectOne((req) => req.url === '/api/paintings').flush({
      data: [
        { id: 1, title: 'No picture', artist_title: 'Nobody', date_display: null, image_id: null },
        { id: 2, title: 'Water Lilies', artist_title: 'Claude Monet', date_display: '1906', image_id: 'abc' },
      ],
    });

    expect(room.text()).toContain('Water Lilies');
    expect(room.text()).toContain('Claude Monet, 1906');
    const img: HTMLImageElement = room.fixture.nativeElement.querySelector('img');
    expect(img.src).toContain('/api/images/paintings/abc');
  });

  it('says nobody is answering when the fetch fails', async () => {
    const room = await openRoom(PaintingRoomComponent);
    failRequest(room.server, /\/api\/paintings/);
    expect(room.text()).toContain("Nobody's answering");
  });
});
