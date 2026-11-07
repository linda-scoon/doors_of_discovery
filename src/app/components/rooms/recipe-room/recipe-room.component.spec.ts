import { RecipeRoomComponent } from './recipe-room.component';
import { failRequest, openRoom } from '../room-frame/room-testing';

describe('RecipeRoomComponent', () => {
  it('shows the dish and links to the cook’s own recipe', async () => {
    const room = await openRoom(RecipeRoomComponent);
    room.server.expectOne('/api/recipe').flush({
      meals: [
        {
          idMeal: '1',
          strMeal: 'Jollof Rice',
          strArea: 'Nigerian',
          strCategory: 'Side',
          strMealThumb: 'https://www.themealdb.com/images/media/meals/x.jpg',
          strSource: 'https://cook.example/jollof',
        },
      ],
    });

    expect(room.text()).toContain('Jollof Rice');
    expect(room.text()).toContain('Nigerian · Side');
    expect(room.fixture.nativeElement.querySelector('a').href).toBe('https://cook.example/jollof');
  });

  it('is bricked up when the fetch fails', async () => {
    const room = await openRoom(RecipeRoomComponent);
    failRequest(room.server, '/api/recipe');
    expect(room.bricked()).toBeTrue();
  });
});
