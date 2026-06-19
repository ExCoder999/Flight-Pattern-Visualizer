import type { FlightTrajectory, FlightState, WeatherPoint } from "./types";

const now = Math.floor(Date.now() / 1000);

export const MOCK_TRAJECTORIES: FlightTrajectory[] = [
  {
    icao24: "a0b1c2",
    callsign: "UAL123",
    startTime: now - 7200,
    endTime: now - 3600,
    path: [
      { timestamp: now - 7200, latitude: 40.6413, longitude: -73.7781, baroAltitude: 0, velocity: 0, trueTrack: 270, onGround: true },
      { timestamp: now - 7000, latitude: 40.65, longitude: -74.0, baroAltitude: 1500, velocity: 120, trueTrack: 268, onGround: false },
      { timestamp: now - 6500, latitude: 40.7, longitude: -74.5, baroAltitude: 6000, velocity: 220, trueTrack: 265, onGround: false },
      { timestamp: now - 6000, latitude: 40.8, longitude: -75.5, baroAltitude: 10000, velocity: 280, trueTrack: 263, onGround: false },
      { timestamp: now - 5500, latitude: 40.9, longitude: -77.0, baroAltitude: 11000, velocity: 290, trueTrack: 261, onGround: false },
      { timestamp: now - 5000, latitude: 41.0, longitude: -79.0, baroAltitude: 11000, velocity: 295, trueTrack: 260, onGround: false },
      { timestamp: now - 4500, latitude: 41.1, longitude: -81.0, baroAltitude: 10800, velocity: 290, trueTrack: 259, onGround: false },
      { timestamp: now - 4000, latitude: 41.2, longitude: -83.0, baroAltitude: 10500, velocity: 285, trueTrack: 258, onGround: false },
      { timestamp: now - 3800, latitude: 41.5, longitude: -84.5, baroAltitude: 8000, velocity: 240, trueTrack: 255, onGround: false },
      { timestamp: now - 3600, latitude: 41.9742, longitude: -87.9073, baroAltitude: 0, velocity: 0, trueTrack: 250, onGround: true },
    ],
  },
  {
    icao24: "d3e4f5",
    callsign: "DAL456",
    startTime: now - 5400,
    endTime: now - 1800,
    path: [
      { timestamp: now - 5400, latitude: 33.6407, longitude: -84.4277, baroAltitude: 0, velocity: 0, trueTrack: 45, onGround: true },
      { timestamp: now - 5200, latitude: 33.7, longitude: -84.2, baroAltitude: 2000, velocity: 150, trueTrack: 45, onGround: false },
      { timestamp: now - 4800, latitude: 34.2, longitude: -83.5, baroAltitude: 8000, velocity: 270, trueTrack: 48, onGround: false },
      { timestamp: now - 4400, latitude: 35.0, longitude: -82.5, baroAltitude: 11000, velocity: 295, trueTrack: 50, onGround: false },
      { timestamp: now - 4000, latitude: 36.0, longitude: -81.0, baroAltitude: 11000, velocity: 300, trueTrack: 52, onGround: false },
      { timestamp: now - 3600, latitude: 37.0, longitude: -79.5, baroAltitude: 10800, velocity: 298, trueTrack: 53, onGround: false },
      { timestamp: now - 3200, latitude: 38.2, longitude: -78.0, baroAltitude: 10500, velocity: 290, trueTrack: 55, onGround: false },
      { timestamp: now - 2800, latitude: 39.5, longitude: -76.5, baroAltitude: 8000, velocity: 240, trueTrack: 57, onGround: false },
      { timestamp: now - 2200, latitude: 40.5, longitude: -75.5, baroAltitude: 3000, velocity: 180, trueTrack: 58, onGround: false },
      { timestamp: now - 1800, latitude: 40.6399, longitude: -75.4404, baroAltitude: 0, velocity: 0, trueTrack: 60, onGround: true },
    ],
  },
  {
    icao24: "a6b7c8",
    callsign: "AAL789",
    startTime: now - 3600,
    endTime: now - 600,
    path: [
      { timestamp: now - 3600, latitude: 33.9425, longitude: -118.408, baroAltitude: 0, velocity: 0, trueTrack: 90, onGround: true },
      { timestamp: now - 3400, latitude: 33.9, longitude: -117.8, baroAltitude: 2500, velocity: 130, trueTrack: 88, onGround: false },
      { timestamp: now - 3000, latitude: 33.8, longitude: -116.5, baroAltitude: 9000, velocity: 265, trueTrack: 87, onGround: false },
      { timestamp: now - 2600, latitude: 33.7, longitude: -114.5, baroAltitude: 11500, velocity: 295, trueTrack: 86, onGround: false },
      { timestamp: now - 2200, latitude: 33.6, longitude: -112.0, baroAltitude: 11500, velocity: 300, trueTrack: 86, onGround: false },
      { timestamp: now - 1800, latitude: 33.5, longitude: -110.0, baroAltitude: 11200, velocity: 298, trueTrack: 86, onGround: false },
      { timestamp: now - 1400, latitude: 33.45, longitude: -108.0, baroAltitude: 10800, velocity: 290, trueTrack: 87, onGround: false },
      { timestamp: now - 1000, latitude: 33.4, longitude: -106.5, baroAltitude: 8000, velocity: 240, trueTrack: 88, onGround: false },
      { timestamp: now - 700, latitude: 33.43, longitude: -105.5, baroAltitude: 3500, velocity: 190, trueTrack: 90, onGround: false },
      { timestamp: now - 600, latitude: 32.8998, longitude: -97.0403, baroAltitude: 0, velocity: 0, trueTrack: 91, onGround: true },
    ],
  },
];

export const MOCK_LIVE_FLIGHTS: FlightState[] = [
  { icao24: "a0b1c2", callsign: "UAL123", originCountry: "United States", longitude: -83.0, latitude: 41.2, baroAltitude: 10500, velocity: 285, trueTrack: 258, verticalRate: -2, onGround: false, timestamp: now },
  { icao24: "d3e4f5", callsign: "DAL456", originCountry: "United States", longitude: -79.5, latitude: 37.0, baroAltitude: 10800, velocity: 298, trueTrack: 53, verticalRate: 0, onGround: false, timestamp: now },
  { icao24: "a6b7c8", callsign: "AAL789", originCountry: "United States", longitude: -110.0, latitude: 33.5, baroAltitude: 11200, velocity: 300, trueTrack: 86, verticalRate: 1, onGround: false, timestamp: now },
];

export const MOCK_WEATHER: WeatherPoint[] = [
  { lat: 40.7128, lon: -74.006, temp: 18, feelsLike: 16, humidity: 65, windSpeed: 5.2, windDeg: 240, description: "Partly cloudy", icon: "02d", precipitation: 0, timestamp: now },
  { lat: 41.8781, lon: -87.6298, temp: 12, feelsLike: 10, humidity: 72, windSpeed: 8.1, windDeg: 180, description: "Overcast", icon: "04d", precipitation: 0.5, timestamp: now },
  { lat: 33.749, lon: -84.388, temp: 24, feelsLike: 26, humidity: 55, windSpeed: 3.8, windDeg: 200, description: "Clear sky", icon: "01d", precipitation: 0, timestamp: now },
  { lat: 33.9425, lon: -118.408, temp: 22, feelsLike: 22, humidity: 60, windSpeed: 4.5, windDeg: 270, description: "Clear sky", icon: "01d", precipitation: 0, timestamp: now },
  { lat: 32.8998, lon: -97.0403, temp: 28, feelsLike: 30, humidity: 45, windSpeed: 6.0, windDeg: 150, description: "Sunny", icon: "01d", precipitation: 0, timestamp: now },
  { lat: 40.6399, lon: -75.4404, temp: 16, feelsLike: 14, humidity: 70, windSpeed: 7.2, windDeg: 260, description: "Light rain", icon: "10d", precipitation: 2.1, timestamp: now },
  { lat: 37.5, lon: -78.0, temp: 20, feelsLike: 19, humidity: 62, windSpeed: 4.9, windDeg: 210, description: "Few clouds", icon: "02d", precipitation: 0, timestamp: now },
  { lat: 35.0, lon: -105.0, temp: 15, feelsLike: 13, humidity: 40, windSpeed: 9.5, windDeg: 300, description: "Windy", icon: "50d", precipitation: 0, timestamp: now },
  { lat: 39.0, lon: -95.0, temp: 21, feelsLike: 21, humidity: 58, windSpeed: 5.5, windDeg: 190, description: "Partly cloudy", icon: "02d", precipitation: 0.2, timestamp: now },
  { lat: 44.0, lon: -90.0, temp: 8, feelsLike: 5, humidity: 80, windSpeed: 11.0, windDeg: 320, description: "Rain showers", icon: "09d", precipitation: 5.4, timestamp: now },
];
