import { RecipeRoomComponent, ingredientsOf, stepsOf } from './recipe-room.component';
import { failRequest, openRoom } from '../room-frame/room-testing';

const jollof = {
  idMeal: '1',
  strMeal: 'Jollof Rice',
  strArea: 'Nigerian',
  strCategory: 'Side',
  strMealThumb: 'https://www.themealdb.com/images/media/meals/x.jpg',
  strSource: 'https://cook.example/jollof',
  strInstructions: 'STEP 1\r\nFry the onions.\r\n\r\nSTEP 2\r\nAdd the rice and stock.',
  strIngredient1: 'Rice',
  strMeasure1: '400g',
  strIngredient2: 'Onion',
  strMeasure2: '1 chopped',
  strIngredient3: ' ',
  strMeasure3: ' ',
};

describe('RecipeRoomComponent', () => {
  it('shows the dish, its ingredients and its method, and links to the original', async () => {
    const room = await openRoom(RecipeRoomComponent);
    room.server.expectOne('/api/recipe').flush({ meals: [jollof] });

    expect(room.text()).toContain('Jollof Rice');
    expect(room.text()).toContain('Nigerian · Side');
    expect(room.text()).toContain('400g Rice');
    expect(room.text()).toContain('Fry the onions.');
    expect(room.fixture.nativeElement.querySelectorAll('ol li').length).toBe(2);
    expect(room.fixture.nativeElement.querySelector('.room-credit a').href).toBe('https://cook.example/jollof');
  });

  it('is bricked up when the fetch fails', async () => {
    const room = await openRoom(RecipeRoomComponent);
    failRequest(room.server, '/api/recipe');
    expect(room.bricked()).toBe(true);
  });
});

describe('reading a TheMealDB recipe', () => {
  it('keeps only the ingredients that are filled in', () => {
    expect(ingredientsOf(jollof)).toEqual([
      { name: 'Rice', measure: '400g' },
      { name: 'Onion', measure: '1 chopped' },
    ]);
  });

  it('splits the method into steps, without its own STEP headings or numbers', () => {
    expect(stepsOf(jollof.strInstructions)).toEqual(['Fry the onions.', 'Add the rice and stock.']);
    expect(stepsOf('1. Boil.\n2) Drain.')).toEqual(['Boil.', 'Drain.']);
    expect(stepsOf(null)).toEqual([]);
  });
});
