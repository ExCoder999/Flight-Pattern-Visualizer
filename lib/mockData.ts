import type { FlightTrajectory, TrajectoryPoint, FlightState, WeatherPoint, Airport } from "./types";

const now = Math.floor(Date.now() / 1000);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toRad(d: number) { return d * Math.PI / 180; }
function toDeg(r: number) { return r * 180 / Math.PI; }

/** Interpolate n+1 points (inclusive of start/end) along a great-circle arc. */
function gcPts(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
  n = 14
): Array<[number, number]> {
  const φ1 = toRad(lat1), λ1 = toRad(lon1);
  const φ2 = toRad(lat2), λ2 = toRad(lon2);
  const d = 2 * Math.asin(Math.sqrt(
    Math.sin((φ2 - φ1) / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2
  ));
  if (d === 0) return [[lat1, lon1]];
  return Array.from({ length: n + 1 }, (_, i) => {
    const f = i / n;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);
    return [toDeg(Math.atan2(z, Math.sqrt(x * x + y * y))), toDeg(Math.atan2(y, x))] as [number, number];
  });
}

/** Build a FlightTrajectory from origin→destination great-circle path. */
function makeIntlRoute(
  icao24: string,
  callsign: string,
  originLat: number, originLon: number,
  destLat: number, destLon: number,
  startSecondsAgo: number,
  durationSeconds: number,
  cruiseAlt = 11800,
  cruiseSpeed = 295
): FlightTrajectory {
  const startTime = now - startSecondsAgo;
  const endTime = startTime + durationSeconds;
  const pts = gcPts(originLat, originLon, destLat, destLon, 14);

  const path: TrajectoryPoint[] = pts.map(([lat, lon], i) => {
    const f = i / (pts.length - 1);
    let alt: number;
    if (f < 0.12) alt = Math.round((f / 0.12) * cruiseAlt);
    else if (f > 0.88) alt = Math.round(((1 - f) / 0.12) * cruiseAlt);
    else alt = cruiseAlt;
    const speed = f < 0.08 || f > 0.92 ? Math.round(cruiseSpeed * 0.6) : cruiseSpeed;
    return {
      timestamp: startTime + Math.round(f * durationSeconds),
      latitude: lat,
      longitude: lon,
      baroAltitude: alt,
      velocity: speed,
      trueTrack: null,
      onGround: i === 0 || i === pts.length - 1,
    };
  });

  return { icao24, callsign, startTime, endTime, path };
}

// ---------------------------------------------------------------------------
// Airports — domestic + international
// ---------------------------------------------------------------------------

export const MOCK_AIRPORTS: Airport[] = [
  // North America
  { icao: "KJFK", name: "John F. Kennedy International",   city: "New York",    lat: 40.6413, lon: -73.7781 },
  { icao: "KORD", name: "O'Hare International",            city: "Chicago",     lat: 41.9742, lon: -87.9073 },
  { icao: "KATL", name: "Hartsfield-Jackson Atlanta",      city: "Atlanta",     lat: 33.6407, lon: -84.4277 },
  { icao: "KLAX", name: "Los Angeles International",       city: "Los Angeles", lat: 33.9425, lon: -118.408 },
  { icao: "KDFW", name: "Dallas/Fort Worth International", city: "Dallas",      lat: 32.8998, lon: -97.0403 },
  { icao: "KSEA", name: "Seattle-Tacoma International",    city: "Seattle",     lat: 47.4502, lon: -122.3088 },
  { icao: "KDEN", name: "Denver International",            city: "Denver",      lat: 39.8561, lon: -104.6737 },
  { icao: "KMIA", name: "Miami International",             city: "Miami",       lat: 25.7959, lon: -80.287 },
  { icao: "KBOS", name: "Boston Logan International",      city: "Boston",      lat: 42.3656, lon: -71.0096 },
  { icao: "CYYZ", name: "Toronto Pearson International",   city: "Toronto",     lat: 43.6772, lon: -79.6306 },
  // Europe
  { icao: "EGLL", name: "Heathrow",                        city: "London",      lat: 51.4700, lon: -0.4543 },
  { icao: "LFPG", name: "Charles de Gaulle",               city: "Paris",       lat: 49.0097, lon:  2.5479 },
  { icao: "EDDF", name: "Frankfurt Airport",               city: "Frankfurt",   lat: 50.0379, lon:  8.5622 },
  { icao: "LEMD", name: "Adolfo Suárez Madrid–Barajas",   city: "Madrid",      lat: 40.4936, lon: -3.5668 },
  { icao: "LIRF", name: "Leonardo da Vinci–Fiumicino",    city: "Rome",        lat: 41.7999, lon: 12.2462 },
  { icao: "EHAM", name: "Amsterdam Airport Schiphol",      city: "Amsterdam",   lat: 52.3086, lon:  4.7639 },
  // Middle East & Africa
  { icao: "OMDB", name: "Dubai International",             city: "Dubai",       lat: 25.2532, lon: 55.3657 },
  { icao: "OTHH", name: "Hamad International",             city: "Doha",        lat: 25.2609, lon: 51.6138 },
  { icao: "FAOR", name: "O.R. Tambo International",        city: "Johannesburg",lat: -26.1392,lon: 28.246  },
  // Asia & Pacific
  { icao: "WSSS", name: "Singapore Changi",                city: "Singapore",   lat:  1.3644, lon: 103.9915 },
  { icao: "RJAA", name: "Narita International",            city: "Tokyo",       lat: 35.7647, lon: 140.3864 },
  { icao: "VHHH", name: "Hong Kong International",         city: "Hong Kong",   lat: 22.3080, lon: 113.9185 },
  { icao: "ZBAA", name: "Beijing Capital International",   city: "Beijing",     lat: 40.0799, lon: 116.5853 },
  { icao: "YSSY", name: "Sydney Kingsford Smith",          city: "Sydney",      lat: -33.9399,lon: 151.1753 },
  // South America
  { icao: "SBGR", name: "Guarulhos International",         city: "São Paulo",   lat: -23.4356,lon: -46.4731 },
];

// ---------------------------------------------------------------------------
// CONUS domestic trajectories (from before)
// ---------------------------------------------------------------------------

export const MOCK_TRAJECTORIES: FlightTrajectory[] = [
  // --- CONUS routes ---
  {
    icao24: "a0b1c2",
    callsign: "UAL123",
    startTime: now - 7200,
    endTime: now - 3600,
    path: [
      { timestamp: now - 7200, latitude: 40.6413, longitude: -73.7781, baroAltitude: 0,     velocity: 0,   trueTrack: 270, onGround: true },
      { timestamp: now - 7000, latitude: 40.65,  longitude: -74.0,    baroAltitude: 1500,  velocity: 120, trueTrack: 268, onGround: false },
      { timestamp: now - 6500, latitude: 40.7,   longitude: -74.5,    baroAltitude: 6000,  velocity: 220, trueTrack: 265, onGround: false },
      { timestamp: now - 6000, latitude: 40.8,   longitude: -75.5,    baroAltitude: 10000, velocity: 280, trueTrack: 263, onGround: false },
      { timestamp: now - 5500, latitude: 40.9,   longitude: -77.0,    baroAltitude: 11000, velocity: 290, trueTrack: 261, onGround: false },
      { timestamp: now - 5000, latitude: 41.0,   longitude: -79.0,    baroAltitude: 11000, velocity: 295, trueTrack: 260, onGround: false },
      { timestamp: now - 4500, latitude: 41.1,   longitude: -81.0,    baroAltitude: 10800, velocity: 290, trueTrack: 259, onGround: false },
      { timestamp: now - 4000, latitude: 41.2,   longitude: -83.0,    baroAltitude: 10500, velocity: 285, trueTrack: 258, onGround: false },
      { timestamp: now - 3800, latitude: 41.5,   longitude: -84.5,    baroAltitude: 8000,  velocity: 240, trueTrack: 255, onGround: false },
      { timestamp: now - 3600, latitude: 41.9742, longitude: -87.9073, baroAltitude: 0,    velocity: 0,   trueTrack: 250, onGround: true },
    ],
  },
  {
    icao24: "d3e4f5",
    callsign: "DAL456",
    startTime: now - 5400,
    endTime: now - 1800,
    path: [
      { timestamp: now - 5400, latitude: 33.6407, longitude: -84.4277, baroAltitude: 0,     velocity: 0,   trueTrack: 45,  onGround: true },
      { timestamp: now - 5200, latitude: 33.7,   longitude: -84.2,    baroAltitude: 2000,  velocity: 150, trueTrack: 45,  onGround: false },
      { timestamp: now - 4800, latitude: 34.2,   longitude: -83.5,    baroAltitude: 8000,  velocity: 270, trueTrack: 48,  onGround: false },
      { timestamp: now - 4400, latitude: 35.0,   longitude: -82.5,    baroAltitude: 11000, velocity: 295, trueTrack: 50,  onGround: false },
      { timestamp: now - 4000, latitude: 36.0,   longitude: -81.0,    baroAltitude: 11000, velocity: 300, trueTrack: 52,  onGround: false },
      { timestamp: now - 3600, latitude: 37.0,   longitude: -79.5,    baroAltitude: 10800, velocity: 298, trueTrack: 53,  onGround: false },
      { timestamp: now - 3200, latitude: 38.2,   longitude: -78.0,    baroAltitude: 10500, velocity: 290, trueTrack: 55,  onGround: false },
      { timestamp: now - 2800, latitude: 39.5,   longitude: -76.5,    baroAltitude: 8000,  velocity: 240, trueTrack: 57,  onGround: false },
      { timestamp: now - 2200, latitude: 40.5,   longitude: -75.5,    baroAltitude: 3000,  velocity: 180, trueTrack: 58,  onGround: false },
      { timestamp: now - 1800, latitude: 40.6399, longitude: -75.4404, baroAltitude: 0,    velocity: 0,   trueTrack: 60,  onGround: true },
    ],
  },
  {
    icao24: "a6b7c8",
    callsign: "AAL789",
    startTime: now - 3600,
    endTime: now - 600,
    path: [
      { timestamp: now - 3600, latitude: 33.9425, longitude: -118.408, baroAltitude: 0,     velocity: 0,   trueTrack: 90, onGround: true },
      { timestamp: now - 3400, latitude: 33.9,   longitude: -117.8,   baroAltitude: 2500,  velocity: 130, trueTrack: 88, onGround: false },
      { timestamp: now - 3000, latitude: 33.8,   longitude: -116.5,   baroAltitude: 9000,  velocity: 265, trueTrack: 87, onGround: false },
      { timestamp: now - 2600, latitude: 33.7,   longitude: -114.5,   baroAltitude: 11500, velocity: 295, trueTrack: 86, onGround: false },
      { timestamp: now - 2200, latitude: 33.6,   longitude: -112.0,   baroAltitude: 11500, velocity: 300, trueTrack: 86, onGround: false },
      { timestamp: now - 1800, latitude: 33.5,   longitude: -110.0,   baroAltitude: 11200, velocity: 298, trueTrack: 86, onGround: false },
      { timestamp: now - 1400, latitude: 33.45,  longitude: -108.0,   baroAltitude: 10800, velocity: 290, trueTrack: 87, onGround: false },
      { timestamp: now - 1000, latitude: 33.4,   longitude: -106.5,   baroAltitude: 8000,  velocity: 240, trueTrack: 88, onGround: false },
      { timestamp: now - 700,  latitude: 33.43,  longitude: -105.5,   baroAltitude: 3500,  velocity: 190, trueTrack: 90, onGround: false },
      { timestamp: now - 600,  latitude: 32.8998, longitude: -97.0403, baroAltitude: 0,    velocity: 0,   trueTrack: 91, onGround: true },
    ],
  },
  {
    icao24: "c9d0e1",
    callsign: "SWA202",
    startTime: now - 8100,
    endTime: now - 5700,
    path: [
      { timestamp: now - 8100, latitude: 39.8561, longitude: -104.6737, baroAltitude: 0,     velocity: 0,   trueTrack: 315, onGround: true },
      { timestamp: now - 7900, latitude: 40.0,   longitude: -104.9,    baroAltitude: 2000,  velocity: 140, trueTrack: 315, onGround: false },
      { timestamp: now - 7500, latitude: 41.0,   longitude: -106.0,    baroAltitude: 9500,  velocity: 275, trueTrack: 318, onGround: false },
      { timestamp: now - 7100, latitude: 42.5,   longitude: -108.0,    baroAltitude: 11200, velocity: 298, trueTrack: 320, onGround: false },
      { timestamp: now - 6700, latitude: 44.0,   longitude: -110.5,    baroAltitude: 11500, velocity: 305, trueTrack: 321, onGround: false },
      { timestamp: now - 6300, latitude: 45.5,   longitude: -113.0,    baroAltitude: 11500, velocity: 300, trueTrack: 322, onGround: false },
      { timestamp: now - 5900, latitude: 47.0,   longitude: -116.0,    baroAltitude: 9000,  velocity: 260, trueTrack: 325, onGround: false },
      { timestamp: now - 5700, latitude: 47.4502, longitude: -122.3088, baroAltitude: 0,    velocity: 0,   trueTrack: 327, onGround: true },
    ],
  },
  {
    icao24: "f2a3b4",
    callsign: "JBU614",
    startTime: now - 6300,
    endTime: now - 2700,
    path: [
      { timestamp: now - 6300, latitude: 42.3656, longitude: -71.0096, baroAltitude: 0,     velocity: 0,   trueTrack: 195, onGround: true },
      { timestamp: now - 6100, latitude: 42.1,   longitude: -71.1,    baroAltitude: 1800,  velocity: 135, trueTrack: 195, onGround: false },
      { timestamp: now - 5700, latitude: 41.0,   longitude: -72.0,    baroAltitude: 8000,  velocity: 265, trueTrack: 196, onGround: false },
      { timestamp: now - 5300, latitude: 39.5,   longitude: -73.5,    baroAltitude: 11000, velocity: 295, trueTrack: 198, onGround: false },
      { timestamp: now - 4900, latitude: 37.5,   longitude: -75.0,    baroAltitude: 11200, velocity: 302, trueTrack: 200, onGround: false },
      { timestamp: now - 4500, latitude: 35.0,   longitude: -76.5,    baroAltitude: 11200, velocity: 300, trueTrack: 200, onGround: false },
      { timestamp: now - 4100, latitude: 32.5,   longitude: -78.0,    baroAltitude: 10800, velocity: 295, trueTrack: 198, onGround: false },
      { timestamp: now - 3700, latitude: 29.5,   longitude: -79.5,    baroAltitude: 8500,  velocity: 255, trueTrack: 196, onGround: false },
      { timestamp: now - 3200, latitude: 26.5,   longitude: -80.1,    baroAltitude: 3000,  velocity: 185, trueTrack: 194, onGround: false },
      { timestamp: now - 2700, latitude: 25.7959, longitude: -80.287,  baroAltitude: 0,    velocity: 0,   trueTrack: 192, onGround: true },
    ],
  },
  {
    icao24: "b5c6d7",
    callsign: "FDX901",
    startTime: now - 9000,
    endTime: now - 5400,
    path: [
      { timestamp: now - 9000, latitude: 33.9425, longitude: -118.408, baroAltitude: 0,     velocity: 0,   trueTrack: 65, onGround: true },
      { timestamp: now - 8800, latitude: 34.1,   longitude: -117.8,   baroAltitude: 2200,  velocity: 145, trueTrack: 65, onGround: false },
      { timestamp: now - 8400, latitude: 34.8,   longitude: -115.5,   baroAltitude: 9800,  velocity: 272, trueTrack: 67, onGround: false },
      { timestamp: now - 8000, latitude: 35.8,   longitude: -112.0,   baroAltitude: 11800, velocity: 302, trueTrack: 69, onGround: false },
      { timestamp: now - 7600, latitude: 36.5,   longitude: -108.5,   baroAltitude: 12000, velocity: 308, trueTrack: 68, onGround: false },
      { timestamp: now - 7200, latitude: 37.5,   longitude: -104.5,   baroAltitude: 12000, velocity: 310, trueTrack: 68, onGround: false },
      { timestamp: now - 6800, latitude: 38.5,   longitude: -100.5,   baroAltitude: 11800, velocity: 305, trueTrack: 67, onGround: false },
      { timestamp: now - 6400, latitude: 39.8,   longitude: -96.5,    baroAltitude: 11500, velocity: 295, trueTrack: 66, onGround: false },
      { timestamp: now - 6000, latitude: 40.8,   longitude: -92.5,    baroAltitude: 10000, velocity: 265, trueTrack: 65, onGround: false },
      { timestamp: now - 5700, latitude: 41.5,   longitude: -89.5,    baroAltitude: 5000,  velocity: 210, trueTrack: 64, onGround: false },
      { timestamp: now - 5400, latitude: 41.9742, longitude: -87.9073, baroAltitude: 0,    velocity: 0,   trueTrack: 63, onGround: true },
    ],
  },

  // --- International great-circle routes ---
  // All timestamps are compressed into the same ~9 000 s window as the CONUS
  // routes so every plane animates at a consistent visual speed on the timeline.
  // The great-circle path is real; only the wall-clock scale is condensed.

  // BAW117: London Heathrow → New York JFK  (westbound transatlantic)
  makeIntlRoute("ba117xx", "BAW117", 51.47, -0.45,   40.64, -73.78,  9000, 8200, 11500, 252),

  // UAL838: Los Angeles → Tokyo Narita  (transpacific)
  makeIntlRoute("ua838xx", "UAL838", 33.94, -118.41, 35.77, 140.39,  8600, 7800, 12000, 258),

  // AFR007: New York JFK → Paris CDG  (eastbound transatlantic)
  makeIntlRoute("af007xx", "AFR007", 40.64, -73.78,  49.01,   2.55,  8100, 7200, 11800, 248),

  // UAE003: London Heathrow → Dubai  (Middle East)
  makeIntlRoute("ek003xx", "UAE003", 51.47, -0.45,   25.25,  55.37,  7600, 6800, 11900, 262),

  // SIA321: Singapore → London Heathrow  (Asia–Europe)
  makeIntlRoute("sq321xx", "SIA321",  1.36, 103.99,  51.47,  -0.45,  7200, 6500, 12000, 270),

  // QFA107: Sydney → Los Angeles  (transpacific south)
  makeIntlRoute("qf107xx", "QFA107", -33.94, 151.18, 33.94, -118.41, 8400, 7600, 12200, 260),

  // CPA251: Hong Kong → London Heathrow  (Asia–Europe polar)
  makeIntlRoute("cx251xx", "CPA251", 22.31, 113.92,  51.47,  -0.45,  7800, 7000, 11800, 265),

  // LAN8009: São Paulo → London  (South America–Europe)
  makeIntlRoute("la8009x", "LAN8009", -23.44, -46.47, 51.47, -0.45, 7400, 6800, 11700, 255),
];

// ---------------------------------------------------------------------------
// Live flight mock (fallback when OpenSky is unreachable)
// ---------------------------------------------------------------------------

export const MOCK_LIVE_FLIGHTS: FlightState[] = [
  { icao24: "a0b1c2", callsign: "UAL123",  originCountry: "United States", longitude: -83.0,    latitude:  41.2,  baroAltitude: 10500, velocity: 285, trueTrack: 258, verticalRate: -2, onGround: false, timestamp: now },
  { icao24: "d3e4f5", callsign: "DAL456",  originCountry: "United States", longitude: -79.5,    latitude:  37.0,  baroAltitude: 10800, velocity: 298, trueTrack:  53, verticalRate:  0, onGround: false, timestamp: now },
  { icao24: "a6b7c8", callsign: "AAL789",  originCountry: "United States", longitude: -110.0,   latitude:  33.5,  baroAltitude: 11200, velocity: 300, trueTrack:  86, verticalRate:  1, onGround: false, timestamp: now },
  { icao24: "c9d0e1", callsign: "SWA202",  originCountry: "United States", longitude: -116.0,   latitude:  47.0,  baroAltitude:  9000, velocity: 260, trueTrack: 325, verticalRate: -5, onGround: false, timestamp: now },
  { icao24: "f2a3b4", callsign: "JBU614",  originCountry: "United States", longitude:  -76.5,   latitude:  35.0,  baroAltitude: 11200, velocity: 300, trueTrack: 200, verticalRate:  0, onGround: false, timestamp: now },
  { icao24: "b5c6d7", callsign: "FDX901",  originCountry: "United States", longitude:  -96.5,   latitude:  39.8,  baroAltitude: 11500, velocity: 295, trueTrack:  66, verticalRate: -1, onGround: false, timestamp: now },
  // International mock live positions (mid-route approximations)
  { icao24: "ba117xx", callsign: "BAW117", originCountry: "United Kingdom", longitude: -37.0,   latitude:  52.0,  baroAltitude: 11500, velocity: 252, trueTrack: 255, verticalRate:  0, onGround: false, timestamp: now },
  { icao24: "ua838xx", callsign: "UAL838", originCountry: "United States",  longitude: 170.0,   latitude:  42.0,  baroAltitude: 12000, velocity: 258, trueTrack: 298, verticalRate:  0, onGround: false, timestamp: now },
  { icao24: "af007xx", callsign: "AFR007", originCountry: "France",         longitude: -30.0,   latitude:  46.0,  baroAltitude: 11800, velocity: 248, trueTrack:  68, verticalRate:  0, onGround: false, timestamp: now },
  { icao24: "sq321xx", callsign: "SIA321", originCountry: "Singapore",      longitude:  55.0,   latitude:  28.0,  baroAltitude: 12000, velocity: 270, trueTrack: 300, verticalRate:  0, onGround: false, timestamp: now },
  { icao24: "qf107xx", callsign: "QFA107", originCountry: "Australia",      longitude:-160.0,   latitude:  10.0,  baroAltitude: 12200, velocity: 260, trueTrack:  38, verticalRate:  0, onGround: false, timestamp: now },
];

// ---------------------------------------------------------------------------
// Weather — global grid (45 points across all continents)
// ---------------------------------------------------------------------------

export const MOCK_WEATHER: WeatherPoint[] = [
  // North America — CONUS
  { lat: 40.7128, lon:  -74.006,  temp: 18, feelsLike: 16, humidity: 65, windSpeed:  5.2, windDeg: 240, description: "Partly cloudy",  icon: "02d", precipitation: 0,   timestamp: now },
  { lat: 41.8781, lon:  -87.6298, temp: 12, feelsLike: 10, humidity: 72, windSpeed:  8.1, windDeg: 180, description: "Overcast",       icon: "04d", precipitation: 0.5, timestamp: now },
  { lat: 33.7490, lon:  -84.388,  temp: 24, feelsLike: 26, humidity: 55, windSpeed:  3.8, windDeg: 200, description: "Clear sky",      icon: "01d", precipitation: 0,   timestamp: now },
  { lat: 33.9425, lon: -118.408,  temp: 22, feelsLike: 22, humidity: 60, windSpeed:  4.5, windDeg: 270, description: "Clear sky",      icon: "01d", precipitation: 0,   timestamp: now },
  { lat: 32.8998, lon:  -97.0403, temp: 28, feelsLike: 30, humidity: 45, windSpeed:  6.0, windDeg: 150, description: "Sunny",          icon: "01d", precipitation: 0,   timestamp: now },
  { lat: 40.6399, lon:  -75.4404, temp: 16, feelsLike: 14, humidity: 70, windSpeed:  7.2, windDeg: 260, description: "Light rain",     icon: "10d", precipitation: 2.1, timestamp: now },
  { lat: 37.5,    lon:  -78.0,    temp: 20, feelsLike: 19, humidity: 62, windSpeed:  4.9, windDeg: 210, description: "Few clouds",     icon: "02d", precipitation: 0,   timestamp: now },
  { lat: 35.0,    lon: -105.0,    temp: 15, feelsLike: 13, humidity: 40, windSpeed:  9.5, windDeg: 300, description: "Windy",          icon: "50d", precipitation: 0,   timestamp: now },
  { lat: 44.0,    lon:  -90.0,    temp:  8, feelsLike:  5, humidity: 80, windSpeed: 11.0, windDeg: 320, description: "Rain showers",   icon: "09d", precipitation: 5.4, timestamp: now },
  { lat: 47.4502, lon: -122.3088, temp: 14, feelsLike: 12, humidity: 78, windSpeed:  6.8, windDeg: 210, description: "Light drizzle",  icon: "09d", precipitation: 1.2, timestamp: now },
  { lat: 39.8561, lon: -104.6737, temp: 17, feelsLike: 15, humidity: 38, windSpeed:  7.5, windDeg: 280, description: "Clear sky",      icon: "01d", precipitation: 0,   timestamp: now },
  { lat: 25.7959, lon:  -80.287,  temp: 29, feelsLike: 33, humidity: 80, windSpeed:  4.2, windDeg: 130, description: "Humid and hot",  icon: "01d", precipitation: 0,   timestamp: now },
  { lat: 42.3656, lon:  -71.0096, temp: 15, feelsLike: 13, humidity: 68, windSpeed:  6.1, windDeg: 250, description: "Partly cloudy",  icon: "02d", precipitation: 0.4, timestamp: now },
  // Canada & Mexico
  { lat: 43.6772, lon:  -79.6306, temp: 10, feelsLike:  8, humidity: 74, windSpeed:  7.8, windDeg: 230, description: "Overcast",       icon: "04d", precipitation: 0.3, timestamp: now },
  { lat: 19.4360, lon:  -99.0721, temp: 21, feelsLike: 20, humidity: 50, windSpeed:  3.2, windDeg: 170, description: "Clear sky",      icon: "01d", precipitation: 0,   timestamp: now },
  // North Atlantic
  { lat: 55.0,    lon:  -30.0,    temp:  6, feelsLike:  2, humidity: 88, windSpeed: 18.0, windDeg: 260, description: "Stormy seas",    icon: "11d", precipitation: 8.0, timestamp: now },
  { lat: 45.0,    lon:  -50.0,    temp:  8, feelsLike:  4, humidity: 82, windSpeed: 14.0, windDeg: 250, description: "Strong winds",   icon: "50d", precipitation: 2.5, timestamp: now },
  // Europe
  { lat: 51.5074, lon:   -0.1278, temp: 13, feelsLike: 11, humidity: 76, windSpeed:  7.0, windDeg: 230, description: "Partly cloudy",  icon: "02d", precipitation: 0.8, timestamp: now },
  { lat: 48.8566, lon:    2.3522, temp: 17, feelsLike: 16, humidity: 60, windSpeed:  5.0, windDeg: 200, description: "Sunny intervals", icon: "02d", precipitation: 0,  timestamp: now },
  { lat: 50.1109, lon:    8.6821, temp: 14, feelsLike: 12, humidity: 68, windSpeed:  6.5, windDeg: 220, description: "Light rain",     icon: "10d", precipitation: 1.5, timestamp: now },
  { lat: 52.3676, lon:    4.9041, temp: 12, feelsLike: 10, humidity: 80, windSpeed:  9.0, windDeg: 240, description: "Overcast",       icon: "04d", precipitation: 1.0, timestamp: now },
  { lat: 40.4168, lon:   -3.7038, temp: 22, feelsLike: 22, humidity: 42, windSpeed:  4.0, windDeg: 180, description: "Sunny",          icon: "01d", precipitation: 0,   timestamp: now },
  { lat: 41.9028, lon:   12.4964, temp: 25, feelsLike: 25, humidity: 38, windSpeed:  3.5, windDeg: 160, description: "Clear sky",      icon: "01d", precipitation: 0,   timestamp: now },
  { lat: 55.7558, lon:   37.6173, temp:  5, feelsLike:  2, humidity: 85, windSpeed: 10.0, windDeg: 350, description: "Snow showers",   icon: "13d", precipitation: 3.0, timestamp: now },
  // Middle East
  { lat: 25.2048, lon:   55.2708, temp: 36, feelsLike: 42, humidity: 65, windSpeed:  5.5, windDeg: 110, description: "Hot and hazy",   icon: "50d", precipitation: 0,   timestamp: now },
  { lat: 25.2854, lon:   51.5310, temp: 34, feelsLike: 40, humidity: 62, windSpeed:  4.8, windDeg: 100, description: "Hot and hazy",   icon: "50d", precipitation: 0,   timestamp: now },
  { lat: 30.0444, lon:   31.2357, temp: 28, feelsLike: 30, humidity: 45, windSpeed:  3.5, windDeg: 340, description: "Clear sky",      icon: "01d", precipitation: 0,   timestamp: now },
  // Africa
  { lat: -26.2041,lon:   28.0473, temp: 18, feelsLike: 17, humidity: 55, windSpeed:  4.0, windDeg: 200, description: "Clear sky",      icon: "01d", precipitation: 0,   timestamp: now },
  { lat:   6.5244,lon:    3.3792, temp: 30, feelsLike: 35, humidity: 80, windSpeed:  3.0, windDeg: 210, description: "Thunderstorms",  icon: "11d", precipitation: 15,  timestamp: now },
  { lat:  -1.2921,lon:   36.8219, temp: 22, feelsLike: 22, humidity: 65, windSpeed:  4.5, windDeg: 150, description: "Partly cloudy",  icon: "02d", precipitation: 0.5, timestamp: now },
  // Asia
  { lat:  35.6762,lon:  139.6503, temp: 19, feelsLike: 18, humidity: 62, windSpeed:  5.8, windDeg: 190, description: "Few clouds",     icon: "02d", precipitation: 0,   timestamp: now },
  { lat:  39.9042,lon:  116.4074, temp: 16, feelsLike: 14, humidity: 55, windSpeed:  7.0, windDeg: 320, description: "Hazy",           icon: "50d", precipitation: 0,   timestamp: now },
  { lat:  22.3193,lon:  114.1694, temp: 25, feelsLike: 28, humidity: 75, windSpeed:  6.0, windDeg: 210, description: "Partly cloudy",  icon: "02d", precipitation: 0.2, timestamp: now },
  { lat:   1.3521,lon:  103.8198, temp: 31, feelsLike: 37, humidity: 82, windSpeed:  3.5, windDeg: 190, description: "Thunderstorm",   icon: "11d", precipitation: 12,  timestamp: now },
  { lat:  55.7522,lon:   83.1146, temp:  2, feelsLike: -2, humidity: 78, windSpeed: 12.0, windDeg: 340, description: "Blowing snow",   icon: "13d", precipitation: 2.0, timestamp: now },
  { lat:  19.0760,lon:   72.8777, temp: 33, feelsLike: 40, humidity: 78, windSpeed:  5.0, windDeg: 230, description: "Humid & warm",   icon: "01d", precipitation: 0,   timestamp: now },
  // South & Southeast Asia
  { lat:  37.5665,lon:  126.9780, temp: 18, feelsLike: 17, humidity: 60, windSpeed:  5.5, windDeg: 300, description: "Clear sky",      icon: "01d", precipitation: 0,   timestamp: now },
  { lat:  -6.2088,lon:  106.8456, temp: 29, feelsLike: 35, humidity: 85, windSpeed:  3.0, windDeg: 200, description: "Tropical rain",  icon: "10d", precipitation: 8.0, timestamp: now },
  // Pacific Ocean
  { lat:  20.0,   lon:  180.0,    temp: 26, feelsLike: 28, humidity: 78, windSpeed:  7.5, windDeg: 220, description: "Trade winds",    icon: "02d", precipitation: 0.5, timestamp: now },
  { lat: -20.0,   lon: -150.0,    temp: 24, feelsLike: 25, humidity: 72, windSpeed:  8.0, windDeg: 100, description: "Partly cloudy",  icon: "02d", precipitation: 0.3, timestamp: now },
  // South America
  { lat: -23.5505,lon:  -46.6333, temp: 25, feelsLike: 27, humidity: 68, windSpeed:  4.0, windDeg: 180, description: "Partly cloudy",  icon: "02d", precipitation: 0.5, timestamp: now },
  { lat: -33.4489,lon:  -70.6693, temp: 16, feelsLike: 15, humidity: 55, windSpeed:  5.5, windDeg: 220, description: "Clear sky",      icon: "01d", precipitation: 0,   timestamp: now },
  { lat:  -3.1190,lon:  -60.0217, temp: 31, feelsLike: 38, humidity: 90, windSpeed:  2.5, windDeg: 160, description: "Heavy rain",     icon: "10d", precipitation: 20,  timestamp: now },
  // Australia
  { lat: -33.8688,lon:  151.2093, temp: 20, feelsLike: 19, humidity: 65, windSpeed:  6.0, windDeg: 200, description: "Partly cloudy",  icon: "02d", precipitation: 0.2, timestamp: now },
  { lat: -27.4698,lon:  153.0251, temp: 24, feelsLike: 25, humidity: 72, windSpeed:  4.5, windDeg: 220, description: "Sunny",          icon: "01d", precipitation: 0,   timestamp: now },
];
