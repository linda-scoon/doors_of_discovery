import { ChapterRoomComponent } from './chapter-room.component';
import { failRequest, openRoom } from '../room-frame/room-testing';

describe('ChapterRoomComponent', () => {
  it('shows a chapter, and where to read on', async () => {
    const room = await openRoom(ChapterRoomComponent);
    room.server.expectOne((req) => /^\/api\/chapter\/\d+$/.test(req.url)).flush({
      title: 'Treasure Island',
      author: 'Robert Louis Stevenson',
      heading: 'CHAPTER I',
      paragraphs: ['Squire Trelawney asked me to write it down.', '<b>not bold</b>'],
      cut: true,
      link: 'https://www.gutenberg.org/ebooks/120',
    });
    expect(room.text()).toContain('Treasure Island');
    expect(room.text()).toContain('CHAPTER I');
    expect(room.text()).toContain('Read on at Project Gutenberg');
    // Text from the book is shown as text, never as markup.
    expect(room.fixture.nativeElement.querySelector('b')).toBeNull();
  });

  it('is bricked up when the book cannot be fetched', async () => {
    const room = await openRoom(ChapterRoomComponent);
    failRequest(room.server, /\/api\/chapter\//);
    expect(room.bricked()).toBe(true);
  });
});
