import { SpaceRoomComponent } from './space-room.component';
import { failRequest, openRoom } from '../room-frame/room-testing';

describe('SpaceRoomComponent', () => {
  it('shows a NASA picture, credited and linked', async () => {
    const room = await openRoom(SpaceRoomComponent);
    room.server.expectOne((req) => req.url.startsWith('/api/space/')).flush({
      collection: {
        items: [
          {
            data: [{ title: 'Pillars of Creation', nasa_id: 'PIA 1', center: 'JPL' }],
            links: [{ href: 'http://images-assets.nasa.gov/pia1.jpg' }],
          },
        ],
      },
    });

    expect(room.text()).toContain('Pillars of Creation');
    expect(room.text()).toContain('NASA JPL');
    const image = room.fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(image.src).toBe('https://images-assets.nasa.gov/pia1.jpg');
    const link = room.fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(link.href).toBe('https://images.nasa.gov/details/PIA%201');
  });

  it('is bricked up when nothing comes back', async () => {
    const room = await openRoom(SpaceRoomComponent);
    room.server.expectOne((req) => req.url.startsWith('/api/space/')).flush({ collection: { items: [] } });
    expect(room.bricked()).toBe(true);
  });

  it('is bricked up when the fetch fails', async () => {
    const room = await openRoom(SpaceRoomComponent);
    failRequest(room.server, /\/api\/space\//);
    expect(room.bricked()).toBe(true);
  });
});
