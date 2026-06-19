import type {
  FlightTrajectory,
  TrajectoryPoint,
  GeoJsonFeatureCollection,
  GeoJsonFeature,
  FlightStats,
  Airport,
} from "./types";

export function trajectoriesToGeoJson(
  trajectories: FlightTrajectory[],
  currentTime: number,
  timeRange: [number, number]
): GeoJsonFeatureCollection {
  const [minT, maxT] = timeRange;

  const features: GeoJsonFeature[] = trajectories
    .map((traj): GeoJsonFeature | null => {
      const filtered = traj.path.filter((p) => {
        const normalized = (p.timestamp - minT) / (maxT - minT || 1);
        return normalized <= currentTime;
      });

      if (filtered.length < 2) return null;

      return {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: filtered.map((p): [number, number, number?] => {
            const coord: [number, number, number?] = [p.longitude, p.latitude];
            if (p.baroAltitude !== null) {
              coord[2] = p.baroAltitude;
            }
            return coord;
          }),
        },
        properties: {
          icao24: traj.icao24,
          callsign: traj.callsign,
          altitude: filtered[filtered.length - 1]?.baroAltitude ?? null,
          velocity: filtered[filtered.length - 1]?.velocity ?? null,
          trueTrack: filtered[filtered.length - 1]?.trueTrack ?? null,
          pointCount: filtered.length,
        },
      };
    })
    .filter((f): f is GeoJsonFeature => f !== null);

  return { type: "FeatureCollection", features };
}

export function getFlightHeadPosition(
  traj: FlightTrajectory,
  currentTime: number,
  timeRange: [number, number]
): TrajectoryPoint | null {
  const [minT, maxT] = timeRange;

  const filtered = traj.path.filter((p) => {
    const normalized = (p.timestamp - minT) / (maxT - minT || 1);
    return normalized <= currentTime;
  });

  return filtered[filtered.length - 1] ?? null;
}

export function flightHeadsToGeoJson(
  trajectories: FlightTrajectory[],
  currentTime: number,
  timeRange: [number, number]
): GeoJsonFeatureCollection {
  const features: GeoJsonFeature[] = trajectories
    .map((traj): GeoJsonFeature | null => {
      const head = getFlightHeadPosition(traj, currentTime, timeRange);
      if (!head) return null;

      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [head.longitude, head.latitude],
        },
        properties: {
          icao24: traj.icao24,
          callsign: traj.callsign,
          altitude: head.baroAltitude,
          velocity: head.velocity,
          trueTrack: head.trueTrack,
          onGround: head.onGround,
        },
      };
    })
    .filter((f): f is GeoJsonFeature => f !== null);

  return { type: "FeatureCollection", features };
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function trajectoryDistanceKm(traj: FlightTrajectory): number {
  let total = 0;
  for (let i = 1; i < traj.path.length; i++) {
    const a = traj.path[i - 1];
    const b = traj.path[i];
    total += haversineKm(a.latitude, a.longitude, b.latitude, b.longitude);
  }
  return total;
}

export function computeFlightStats(trajectories: FlightTrajectory[]): FlightStats {
  if (trajectories.length === 0) {
    return { totalRoutes: 0, totalDistanceKm: 0, avgSpeedKts: 0, maxAltitudeFt: 0, countries: [] };
  }
  const totalDistanceKm = trajectories.reduce((acc, t) => acc + trajectoryDistanceKm(t), 0);
  const allSpeeds = trajectories.flatMap((t) => t.path.map((p) => p.velocity ?? 0)).filter((v) => v > 0);
  const avgSpeedMs = allSpeeds.length ? allSpeeds.reduce((a, b) => a + b, 0) / allSpeeds.length : 0;
  const maxAltM = Math.max(0, ...trajectories.flatMap((t) => t.path.map((p) => p.baroAltitude ?? 0)));
  return {
    totalRoutes: trajectories.length,
    totalDistanceKm: Math.round(totalDistanceKm),
    avgSpeedKts: Math.round(avgSpeedMs * 1.94384),
    maxAltitudeFt: Math.round(maxAltM * 3.28084),
    countries: ["United States"],
  };
}

export function airportsToGeoJson(airports: Airport[]): GeoJsonFeatureCollection {
  return {
    type: "FeatureCollection",
    features: airports.map((a) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [a.lon, a.lat] },
      properties: { icao: a.icao, name: a.name, city: a.city },
    })),
  };
}

export function interpolateColor(
  value: number,
  min: number,
  max: number,
  colors: [string, string, string]
): string {
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min || 1)));
  if (ratio < 0.5) {
    return interpolateTwoColors(colors[0], colors[1], ratio * 2);
  }
  return interpolateTwoColors(colors[1], colors[2], (ratio - 0.5) * 2);
}

function interpolateTwoColors(c1: string, c2: string, t: number): string {
  const r1 = parseInt(c1.slice(1, 3), 16);
  const g1 = parseInt(c1.slice(3, 5), 16);
  const b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16);
  const g2 = parseInt(c2.slice(3, 5), 16);
  const b2 = parseInt(c2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${b})`;
}
