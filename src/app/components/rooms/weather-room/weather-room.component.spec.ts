import { WeatherRoomComponent } from './weather-room.component';
import { failRequest, openRoom } from '../room-frame/room-testing';
import cities from '../../../../../shared/cities.json';

describe('WeatherRoomComponent', () => {
  it('shows the weather and local time in one of the cities', async () => {
    const room = await openRoom(WeatherRoomComponent);
    const same = { current: { time: '2026-11-07T15:30', temperature_2m: 11.6, weather_code: 61, is_day: 1, wind_speed_10m: 20 } };
    room.server.expectOne('/api/weather').flush(cities.map(() => same));

    expect(room.text()).toContain('12°C');
    expect(room.text()).toContain('Rain');
    expect(room.text()).toContain('15:30');
    expect(cities.some((c) => room.text().includes(c.name))).toBe(true);
  });

  it('is bricked up when the fetch fails', async () => {
    const room = await openRoom(WeatherRoomComponent);
    failRequest(room.server, '/api/weather');
    expect(room.bricked()).toBe(true);
  });
});
