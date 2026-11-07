import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { roomLoad } from '../room-frame/room-load';

/**
 * The parts of a TheMealDB meal the room uses. Ingredients and their
 * measures come as twenty numbered pairs, strIngredient1 to 20, mostly
 * empty.
 */
interface Meal {
  idMeal: string;
  strMeal: string;
  strArea?: string | null;
  strCategory?: string | null;
  strMealThumb: string;
  strSource?: string | null;
  strInstructions?: string | null;
  [numbered: string]: string | null | undefined;
}

export interface Ingredient {
  measure: string;
  name: string;
}

/**
 * Something cooking: a random recipe from TheMealDB -- the dish on a plate,
 * then a recipe card with the ingredients and the method, to scroll through
 * and read in the doorway.
 */
@Component({
  selector: 'app-recipe-room',
  imports: [RoomFrameComponent],
  templateUrl: './recipe-room.component.html',
  styleUrls: ['./recipe-room.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeRoomComponent {
  private readonly http = inject(HttpClient);

  readonly meal = roomLoad(() =>
    this.http.get<{ meals: Meal[] }>('/api/recipe').pipe(
      map((response) => {
        const meal = response?.meals?.[0];
        if (!meal?.strMeal || !meal.strMealThumb) throw new Error('No recipe in the response');
        return {
          name: meal.strMeal,
          // Only the parts it has: "Italian · Pasta", "Pasta", or nothing.
          kind: [meal.strArea, meal.strCategory].filter((part) => part && part !== 'Unknown').join(' · '),
          // The small size is plenty for a doorway.
          image: `${meal.strMealThumb}/medium`,
          ingredients: ingredientsOf(meal),
          steps: stepsOf(meal.strInstructions),
          // The cook's own recipe when TheMealDB has it, otherwise its page.
          link: meal.strSource || `https://www.themealdb.com/meal/${meal.idMeal}`,
        };
      })
    )
  );
}

/** The ingredients that are filled in, each with its measure. */
export function ingredientsOf(meal: Meal): Ingredient[] {
  const ingredients: Ingredient[] = [];
  for (let i = 1; i <= 20; i += 1) {
    const name = meal[`strIngredient${i}`]?.trim();
    if (name) ingredients.push({ name, measure: meal[`strMeasure${i}`]?.trim() ?? '' });
  }
  return ingredients;
}

/**
 * The method as separate steps. It arrives as one block with line breaks,
 * sometimes with "STEP 1" headings or "1." in front, which go, since the
 * steps are numbered here.
 */
export function stepsOf(instructions: string | null | undefined): string[] {
  return (instructions ?? '')
    .split(/\r?\n+/)
    .map((line) => line.trim().replace(/^(step\s*\d+\s*[:.)-]?|\d+\s*[.)])\s*/i, '').trim())
    .filter((line) => line.length > 0);
}
