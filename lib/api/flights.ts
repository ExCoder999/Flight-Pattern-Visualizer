import type { FlightTrajectory, FlightState } from "../types";
import { MOCK_TRAJECTORIES, MOCK_LIVE_FLIGHTS } from "../mockData";

const OPENSKY_BASE = "https://opensky-network.org/api";

function buildAuthHeader(): HeadersInit {
  const user = process.env.OPENSKY_USERNAME;
  const pass = process.env.OPENSKY_PASSWORD;
  if (!user || !pass) return {};
  const encoded = Buffer.from(`${user}:${pass}`).toString("base64");
  return { Authorization: `Basic ${encoded}` };
}

/** Fetch all airborne aircraft worldwide from OpenSky (no credentials required). */
export async function fetchLiveFlights(): Promise<FlightState[]> {
  try {
    const res = await fetch(`${OPENSKY_BASE}/states/all`, {
      headers: buildAuthHeader(),
      next: { revalidate: 30 },
    });

    if (!res.ok) return MOCK_LIVE_FLIGHTS;

    const data = (await res.json()) as { states?: unknown[][] };
    if (!data.states) return MOCK_LIVE_FLIGHTS;

    const airborne = data.states
      .filter(
        (s): s is unknown[] =>
          typeof s[5] === "number" &&
          typeof s[6] === "number" &&
          s[8] === false // not on ground
      )
      .slice(0, 600);

    if (airborne.length === 0) return MOCK_LIVE_FLIGHTS;

    return airborne.map(
      (s): FlightState => ({
        icao24: String(s[0] ?? ""),
        callsign: String(s[1] ?? "").trim(),
        originCountry: String(s[2] ?? ""),
        longitude: typeof s[5] === "number" ? s[5] : null,
        latitude: typeof s[6] === "number" ? s[6] : null,
        baroAltitude: typeof s[7] === "number" ? s[7] : null,
        velocity: typeof s[9] === "number" ? s[9] : null,
        trueTrack: typeof s[10] === "number" ? s[10] : null,
        verticalRate: typeof s[11] === "number" ? s[11] : null,
        onGround: Boolean(s[8]),
        timestamp:
          typeof s[3] === "number" ? s[3] : Math.floor(Date.now() / 1000),
      })
    );
  } catch {
    return MOCK_LIVE_FLIGHTS;
  }
}

export async function fetchFlightTrajectory(
  icao24: string,
  beginTime: number
): Promise<FlightTrajectory | null> {
  const user = process.env.OPENSKY_USERNAME;
  if (!user) {
    return MOCK_TRAJECTORIES.find((t) => t.icao24 === icao24) ?? null;
  }

  try {
    const url = `${OPENSKY_BASE}/tracks/all?icao24=${icao24}&time=${beginTime}`;
    const res = await fetch(url, {
      headers: buildAuthHeader(),
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      icao24?: string;
      callsign?: string;
      startTime?: number;
      endTime?: number;
      path?: [number, number | null, number | null, number | null, number | null, boolean][];
    };
    if (!data.path) return null;

    return {
      icao24: data.icao24 ?? icao24,
      callsign: (data.callsign ?? "").trim(),
      startTime: data.startTime ?? beginTime,
      endTime: data.endTime ?? Math.floor(Date.now() / 1000),
      path: data.path.map((p) => ({
        timestamp: p[0],
        latitude: p[1] ?? 0,
        longitude: p[2] ?? 0,
        baroAltitude: p[3],
        velocity: p[4],
        trueTrack: null,
        onGround: p[5],
      })),
    };
  } catch {
    return null;
  }
}

export async function fetchHistoricalTrajectories(): Promise<FlightTrajectory[]> {
  return MOCK_TRAJECTORIES;
}
