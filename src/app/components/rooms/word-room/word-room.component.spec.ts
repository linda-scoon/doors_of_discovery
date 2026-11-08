import { WordRoomComponent } from './word-room.component';
import { failRequest, openRoom } from '../room-frame/room-testing';
import { WORDS_FROM_ELSEWHERE } from './words';

describe('WordRoomComponent', () => {
  afterEach(() => vi.restoreAllMocks());

  it('looks up an English word', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
    const room = await openRoom(WordRoomComponent);
    room.server.expectOne((req) => req.url.startsWith('/api/dictionary/')).flush([
      {
        word: 'serendipity',
        phonetic: '/ˌsɛɹ.ənˈdɪp.ɪ.ti/',
        meanings: [{ partOfSpeech: 'noun', definitions: [{ definition: 'A happy accident.' }] }],
        sourceUrls: ['https://en.wiktionary.org/wiki/serendipity'],
      },
    ]);
    expect(room.text()).toContain('serendipity');
    expect(room.text()).toContain('noun');
    expect(room.text()).toContain('A happy accident.');
  });

  it('brings a word from another language, with no fetch', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const room = await openRoom(WordRoomComponent);
    room.server.expectNone(() => true);
    const word = WORDS_FROM_ELSEWHERE.find((w) => room.text().includes(w.word))!;
    expect(room.text()).toContain(word.language);
  });

  it('is bricked up when the dictionary is down', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
    const room = await openRoom(WordRoomComponent);
    failRequest(room.server, /\/api\/dictionary\//);
    expect(room.bricked()).toBe(true);
  });
});
