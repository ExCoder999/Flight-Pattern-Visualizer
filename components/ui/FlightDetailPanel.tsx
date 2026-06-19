"use client";

import type { FlightTrajectory } from "@/lib/types";

interface FlightDetailPanelProps {
  trajectory: FlightTrajectory | null;
  onClose: () => void;
}

function formatDuration(start: number, end: number): string {
  const seconds = end - start;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatAlt(meters: number | null): string {
  if (meters === null) return "—";
  const feet = Math.round(meters * 3.28084);
  return `${feet.toLocaleString()} ft`;
}

function formatSpeed(ms: number | null): string {
  if (ms === null) return "—";
  return `${Math.round(ms * 1.94384)} kts`;
}

export default function FlightDetailPanel({ trajectory, onClose }: FlightDetailPanelProps) {
  if (!trajectory) return null;

  const maxAlt = Math.max(...trajectory.path.map((p) => p.baroAltitude ?? 0));
  const maxSpeed = Math.max(...trajectory.path.map((p) => p.velocity ?? 0));
  const avgSpeed =
    trajectory.path.reduce((acc, p) => acc + (p.velocity ?? 0), 0) /
    Math.max(1, trajectory.path.filter((p) => p.velocity !== null).length);

  const cruisePoints = trajectory.path.filter(
    (p) => p.baroAltitude !== null && p.baroAltitude > maxAlt * 0.85
  );
  const cruiseAlt = cruisePoints.length > 0
    ? cruisePoints.reduce((a, p) => a + (p.baroAltitude ?? 0), 0) / cruisePoints.length
    : null;

  return (
    <div className="bg-slate-900/95 backdrop-blur border border-slate-700 rounded-xl p-4 shadow-lg">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white font-bold text-lg leading-tight">
            {trajectory.callsign || trajectory.icao24}
          </h3>
          <p className="text-slate-400 text-xs font-mono">{trajectory.icao24}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-800"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <StatCard label="Duration" value={formatDuration(trajectory.startTime, trajectory.endTime)} />
        <StatCard label="Waypoints" value={String(trajectory.path.length)} />
        <StatCard label="Max Altitude" value={formatAlt(maxAlt || null)} />
        <StatCard label="Cruise Alt" value={formatAlt(cruiseAlt)} />
        <StatCard label="Max Speed" value={formatSpeed(maxSpeed || null)} />
        <StatCard label="Avg Speed" value={formatSpeed(avgSpeed || null)} />
      </div>

      <div className="mt-3 pt-3 border-t border-slate-700">
        <p className="text-slate-400 text-xs mb-2">Altitude Profile</p>
        <AltitudeChart path={trajectory.path} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-800 rounded-lg p-2">
      <p className="text-slate-400 text-xs">{label}</p>
      <p className="text-white font-semibold text-sm mt-0.5">{value}</p>
    </div>
  );
}

function AltitudeChart({ path }: { path: FlightTrajectory["path"] }) {
  const withAlt = path.filter((p) => p.baroAltitude !== null);
  if (withAlt.length === 0) return <div className="text-slate-500 text-xs">No altitude data</div>;

  const maxAlt = Math.max(...withAlt.map((p) => p.baroAltitude!));
  const minAlt = 0;
  const H = 48;
  const W = 200;

  const points = withAlt.map((p, i) => {
    const x = (i / Math.max(1, withAlt.length - 1)) * W;
    const y = H - ((p.baroAltitude! - minAlt) / Math.max(1, maxAlt - minAlt)) * H;
    return `${x},${y}`;
  });

  const fillPath = `M0,${H} L${points.join(" L")} L${W},${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-12" preserveAspectRatio="none">
      <defs>
        <linearGradient id="altGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#altGrad)" />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="#60a5fa"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
