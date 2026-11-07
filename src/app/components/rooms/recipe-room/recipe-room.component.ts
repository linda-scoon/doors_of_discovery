import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { roomLoad } from '../room-frame/room-load';

/** The parts of a TheMealDB meal the room uses. */
interface Meal {
  idMeal: string;
  strMeal: string;
  strArea?: string | null;
  strCategory?: string | null;
  strMealThumb: string;
  strSource?: string | null;
}

/** Something cooking: a random recipe from TheMealDB, with its picture. */
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
          // The cook's own recipe when TheMealDB has it, otherwise its page.
          link: meal.strSource || `https://www.themealdb.com/meal/${meal.idMeal}`,
        };
      })
    )
  );
}
