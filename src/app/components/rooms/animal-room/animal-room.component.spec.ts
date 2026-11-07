import { AnimalRoomComponent } from './animal-room.component';
import { openRoom } from '../room-frame/room-testing';

describe('AnimalRoomComponent', () => {
  it('shows whichever animal it asked for, credited to where it came from', async () => {
    const room = await openRoom(AnimalRoomComponent);
    const request = room.server.expectOne((req) => req.url.startsWith('/api/animals/'));
    const animal = request.request.url.split('/').pop();

    const answers: Record<string, [object, string]> = {
      dog: [{ message: 'https://images.dog.ceo/breeds/hound-afghan/x.jpg' }, 'afghan hound'],
      cat: [{ url: 'https://cataas.com/cat/x' }, 'a cat'],
      fox: [{ image: 'https://randomfox.ca/images/1.jpg' }, 'a fox'],
      duck: [{ url: 'http://random-d.uk/api/1.jpg' }, 'a duck'],
    };
    const [body, who] = answers[animal!];
    request.flush(body);

    expect(room.text().toLowerCase()).toContain(who);
    // Never an http picture on an https page.
    expect(room.fixture.nativeElement.querySelector('img').src).toMatch(/^https:/);
  });
});
