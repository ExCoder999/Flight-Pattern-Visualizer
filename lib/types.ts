export interface FlightState {
  icao24: string;
  callsign: string;
  originCountry: string;
  longitude: number | null;
  latitude: number | null;
  baroAltitude: number | null;
  velocity: number | null;
  trueTrack: number | null;
  verticalRate: number | null;
  onGround: boolean;
  timestamp: number;
}

export interface FlightTrajectory {
  icao24: string;
  callsign: string;
  startTime: number;
  endTime: number;
  path: TrajectoryPoint[];
}

export interface TrajectoryPoint {
  timestamp: number;
  latitude: number;
  longitude: number;
  baroAltitude: number | null;
  velocity: number | null;
  trueTrack: number | null;
  onGround: boolean;
}

export interface WeatherPoint {
  lat: number;
  lon: number;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDeg: number;
  description: string;
  icon: string;
  precipitation: number;
  timestamp: number;
}

export type WeatherLayerType = "temperature" | "wind" | "precipitation" | "none";

export interface UIFilters {
  selectedFlightId: string | null;
  timeRange: [number, number];
  currentTime: number;
  activeWeatherLayer: WeatherLayerType;
  showFlightPaths: boolean;
  isPlaying: boolean;
}

export interface AppState {
  flights: FlightTrajectory[];
  liveFlights: FlightState[];
  weather: WeatherPoint[];
  ui: UIFilters;
}

export interface GeoJsonFeatureCollection {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
}

export interface GeoJsonFeature {
  type: "Feature";
  geometry: GeoJsonLineString | GeoJsonPoint;
  properties: Record<string, unknown>;
}

export interface GeoJsonLineString {
  type: "LineString";
  coordinates: [number, number, number?][];
}

export interface GeoJsonPoint {
  type: "Point";
  coordinates: [number, number];
}
