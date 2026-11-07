import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

import { RoomFrameComponent } from '../room-frame/room-frame.component';
import { roomLoad } from '../room-frame/room-load';
import cities from '../../../../../shared/cities.json';

/** One city's weather, in the order of shared/cities.json. */
interface CurrentWeather {
  current: {
    time: string;
    temperature_2m: number;
    weather_code: number;
    is_day: number;
    wind_speed_10m: number;
  };
}

/** WMO weather codes, as Open-Meteo uses them. */
const CONDITIONS: ReadonlyArray<[number[], string, string]> = [
  [[0], 'Clear sky', '☀️'],
  [[1, 2], 'A few clouds', '⛅'],
  [[3], 'Overcast', '☁️'],
  [[45, 48], 'Fog', '🌫️'],
  [[51, 53, 55, 56, 57], 'Drizzle', '🌦️'],
  [[61, 63, 65, 66, 67, 80, 81, 82], 'Rain', '🌧️'],
  [[71, 73, 75, 77, 85, 86], 'Snow', '❄️'],
  [[95, 96, 99], 'Thunderstorms', '⛈️'],
];

/**
 * A window onto somewhere else: the weather right now in one of fifty-odd
 * cities around the world, and what time it is there.
 */
@Component({
  selector: 'app-weather-room',
  imports: [RoomFrameComponent],
  templateUrl: './weather-room.component.html',
  styleUrls: ['./weather-room.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeatherRoomComponent {
  private readonly http = inject(HttpClient);

  readonly weather = roomLoad(() =>
    this.http.get<CurrentWeather[]>('/api/weather').pipe(
      map((all) => {
        const index = Math.floor(Math.random() * cities.length);
        const now = all?.[index]?.current;
        if (!now) throw new Error('No weather for that city');

        const [, condition, icon] =
          CONDITIONS.find(([codes]) => codes.includes(now.weather_code)) ?? [[], 'Weather', '🌡️'];
        // Open-Meteo gives the local time as "2026-11-07T15:30".
        const [hours, minutes] = now.time.slice(11, 16).split(':').map(Number);

        return {
          city: cities[index].name,
          country: cities[index].country,
          temperature: Math.round(now.temperature_2m),
          condition,
          icon: now.is_day || condition !== 'Clear sky' ? icon : '🌙',
          wind: Math.round(now.wind_speed_10m),
          time: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
          isDay: Boolean(now.is_day),
        };
      })
    )
  );
}
