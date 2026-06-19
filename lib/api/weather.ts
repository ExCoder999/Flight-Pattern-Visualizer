import type { WeatherPoint } from "../types";
import { MOCK_WEATHER } from "../mockData";

const OWM_BASE = "https://api.openweathermap.org/data/3.0/onecall";

interface OwmResponse {
  lat: number;
  lon: number;
  current: {
    dt: number;
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    wind_deg: number;
    weather: Array<{ description: string; icon: string }>;
    rain?: { "1h": number };
  };
}

export async function fetchWeatherAtPoint(lat: number, lon: number): Promise<WeatherPoint | null> {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `${OWM_BASE}?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&appid=${apiKey}&units=metric`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return null;

    const data = await res.json() as OwmResponse;
    const c = data.current;
    return {
      lat: data.lat,
      lon: data.lon,
      temp: c.temp,
      feelsLike: c.feels_like,
      humidity: c.humidity,
      windSpeed: c.wind_speed,
      windDeg: c.wind_deg,
      description: c.weather[0]?.description ?? "",
      icon: c.weather[0]?.icon ?? "01d",
      precipitation: c.rain?.["1h"] ?? 0,
      timestamp: c.dt,
    };
  } catch {
    return null;
  }
}

const CONUS_GRID_POINTS: Array<[number, number]> = [
  [40.7128, -74.006],
  [41.8781, -87.6298],
  [33.749, -84.388],
  [33.9425, -118.408],
  [32.8998, -97.0403],
  [40.6399, -75.4404],
  [37.5, -78.0],
  [35.0, -105.0],
  [39.0, -95.0],
  [44.0, -90.0],
  [47.6062, -122.3321],
  [29.7604, -95.3698],
  [39.7392, -104.9903],
  [38.9072, -77.0369],
  [25.7617, -80.1918],
];

export async function fetchWeatherGrid(): Promise<WeatherPoint[]> {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    return MOCK_WEATHER;
  }

  try {
    const results = await Promise.all(
      CONUS_GRID_POINTS.map(([lat, lon]) => fetchWeatherAtPoint(lat, lon))
    );
    const valid = results.filter((w): w is WeatherPoint => w !== null);
    return valid.length > 0 ? valid : MOCK_WEATHER;
  } catch {
    return MOCK_WEATHER;
  }
}
