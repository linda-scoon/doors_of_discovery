import { WikipediaRoomComponent } from './wikipedia-room.component';
import { failRequest, openRoom } from '../room-frame/room-testing';

describe('WikipediaRoomComponent', () => {
  it('shows the article and links back to it, as its licence asks', async () => {
    const room = await openRoom(WikipediaRoomComponent);
    room.server.expectOne((req) => /^\/api\/wikipedia\/[A-Y][A-Z]$/.test(req.url)).flush({
      query: {
        pages: {
          '1': {
            title: 'Doorknob',
            extract: 'A doorknob is a knob fixed to a door, turned to release the latch so it opens.',
            canonicalurl: 'https://en.wikipedia.org/wiki/Doorknob',
          },
        },
      },
    });

    expect(room.text()).toContain('Doorknob');
    expect(room.text()).toContain('A doorknob is a knob fixed to a door');
    expect(room.text()).toContain('CC BY-SA');
    expect(room.fixture.nativeElement.querySelector('a').href).toContain('/wiki/Doorknob');
  });

  it('passes over disambiguation pages and stubs', async () => {
    const room = await openRoom(WikipediaRoomComponent);
    room.server.expectOne((req) => /^\/api\/wikipedia\/[A-Y][A-Z]$/.test(req.url)).flush({
      query: {
        pages: {
          '1': {
            title: 'Zebari',
            extract: 'Zebari may refer to: a tribe, a surname, and several other things besides.',
            canonicalurl: 'https://en.wikipedia.org/wiki/Zebari',
            pageprops: { disambiguation: '' },
          },
          '2': { title: 'Stub', extract: 'Short.', canonicalurl: 'https://en.wikipedia.org/wiki/Stub' },
          '3': {
            title: 'Lintel',
            extract: 'A lintel is a beam placed across the opening of a door or window in a building.',
            canonicalurl: 'https://en.wikipedia.org/wiki/Lintel',
          },
        },
      },
    });

    expect(room.text()).toContain('Lintel');
    expect(room.text()).not.toContain('Zebari');
  });

  it('prefers an article with a picture, like a good encyclopedia', async () => {
    const room = await openRoom(WikipediaRoomComponent);
    room.server.expectOne((req) => /^\/api\/wikipedia\/[A-Y][A-Z]$/.test(req.url)).flush({
      query: {
        pages: {
          '1': {
            title: 'Plain',
            extract: 'An article with plenty to read but no picture at all to look at, sadly.',
            canonicalurl: 'https://en.wikipedia.org/wiki/Plain',
          },
          '2': {
            title: 'Dodo',
            extract: 'The dodo is an extinct flightless bird that was endemic to the island of Mauritius.',
            canonicalurl: 'https://en.wikipedia.org/wiki/Dodo',
            thumbnail: { source: 'https://upload.wikimedia.org/dodo.jpg' },
          },
        },
      },
    });

    expect(room.text()).toContain('Dodo');
    expect(room.text()).toContain('Vol. D');
    expect(room.fixture.nativeElement.querySelector('img').src).toContain('dodo.jpg');
  });

  it('takes the picture plate away if the picture will not load', async () => {
    const room = await openRoom(WikipediaRoomComponent);
    room.server.expectOne((req) => /^\/api\/wikipedia\/[A-Y][A-Z]$/.test(req.url)).flush({
      query: {
        pages: {
          '1': {
            title: 'Dodo',
            extract: 'The dodo is an extinct flightless bird that was endemic to the island of Mauritius.',
            canonicalurl: 'https://en.wikipedia.org/wiki/Dodo',
            thumbnail: { source: 'https://upload.wikimedia.org/dodo.jpg' },
          },
        },
      },
    });
    room.fixture.detectChanges();

    room.fixture.nativeElement.querySelector('img').dispatchEvent(new Event('error'));
    room.fixture.detectChanges();

    expect(room.fixture.nativeElement.querySelector('figure')).toBeNull();
    expect(room.text()).toContain('The dodo is an extinct flightless bird');
  });

  it('is bricked up when the fetch fails', async () => {
    const room = await openRoom(WikipediaRoomComponent);
    failRequest(room.server, /\/api\/wikipedia\//);
    expect(room.bricked()).toBeTrue();
  });
});
