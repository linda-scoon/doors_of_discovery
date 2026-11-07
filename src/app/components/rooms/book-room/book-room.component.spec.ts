import { BookRoomComponent } from './book-room.component';
import { openRoom } from '../room-frame/room-testing';
import subjects from '../../../../../shared/book-subjects.json';

const work = {
  key: '/works/OL1W',
  title: 'The Hobbit',
  authors: [{ name: 'J. R. R. Tolkien' }],
  cover_id: 123,
  first_publish_year: 1937,
};

const ownStory = {
  title: 'Well Then',
  description: 'Three years married…',
  url: 'https://silverfootfalls.com/story/well-then',
  cover: 'https://silverfootfalls.com/covers/well_then.webp',
};

describe('BookRoomComponent', () => {
  it('recommends a book on one of the subjects, with its cover and a link', async () => {
    spyOn(Math, 'random').and.returnValue(0.9); // A book, not our own.
    const room = await openRoom(BookRoomComponent);
    const request = room.server.expectOne((req) => req.url.startsWith('/api/books/'));
    expect(subjects.map((s) => s.slug)).toContain(request.request.url.split('/').pop()!);

    request.flush({ works: [work] });

    expect(room.text()).toContain('Staff pick');
    expect(room.text()).toContain('The Hobbit');
    expect(room.text()).toContain('J. R. R. Tolkien, 1937');
    expect(room.fixture.nativeElement.querySelector('img').src).toContain('/b/id/123-M.jpg');
  });

  it('now and then shows one of our own stories: its cover, title, 18+, synopsis, link', async () => {
    spyOn(Math, 'random').and.returnValue(0.1);
    const room = await openRoom(BookRoomComponent);
    room.server.expectOne('/api/silverfoot').flush({ stories: [ownStory] });

    expect(room.text()).toContain('Well Then');
    expect(room.text()).toContain('18+');
    expect(room.text()).toContain('Three years married');
    expect(room.text()).not.toContain('own shelf');
    expect(room.fixture.nativeElement.querySelector('img').src).toBe(ownStory.cover);

    const site: HTMLAnchorElement = room.fixture.nativeElement.querySelector('a.book-room__site');
    expect(site.textContent!.trim()).toBe('Silver Footfalls');
    expect(site.href).toBe('https://silverfootfalls.com/story/well-then');
  });

  it('recommends a book instead if our own stories cannot be read', async () => {
    spyOn(Math, 'random').and.returnValue(0.1);
    const room = await openRoom(BookRoomComponent);
    room.server.expectOne('/api/silverfoot').flush({}, { status: 502, statusText: 'Bad Gateway' });
    room.server.expectOne((req) => req.url.startsWith('/api/books/')).flush({ works: [work] });

    expect(room.text()).toContain('The Hobbit');
  });

  it('is bricked up when no book can be found', async () => {
    spyOn(Math, 'random').and.returnValue(0.9);
    const room = await openRoom(BookRoomComponent);
    room.server
      .expectOne((req) => req.url.startsWith('/api/books/'))
      .flush({}, { status: 502, statusText: 'Bad Gateway' });

    expect(room.bricked()).toBeTrue();
  });
});
