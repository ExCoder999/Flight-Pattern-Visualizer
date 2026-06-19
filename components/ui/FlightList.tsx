"use client";

import { useState, useMemo } from "react";
import type { FlightTrajectory } from "@/lib/types";
import { trajectoryDistanceKm } from "@/lib/geoUtils";

interface FlightListProps {
  trajectories: FlightTrajectory[];
  selectedFlightId: string | null;
  currentTime: number;
  timeRange: [number, number];
  onSelect: (id: string | null) => void;
}

function getProgressColor(alt: number | null): string {
  if (alt === null || alt === 0) return "bg-slate-500";
  if (alt > 10000) return "bg-red-400";
  if (alt > 7000) return "bg-amber-400";
  if (alt > 3000) return "bg-cyan-400";
  return "bg-blue-400";
}

function HeadPosition(
  traj: FlightTrajectory,
  currentTime: number,
  timeRange: [number, number]
) {
  const [minT, maxT] = timeRange;
  return traj.path.findLast?.(
    (p) => (p.timestamp - minT) / (maxT - minT || 1) <= currentTime
  ) ?? traj.path[0];
}

export default function FlightList({
  trajectories,
  selectedFlightId,
  currentTime,
  timeRange,
  onSelect,
}: FlightListProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return trajectories;
    return trajectories.filter(
      (t) =>
        t.callsign.toLowerCase().includes(q) || t.icao24.toLowerCase().includes(q)
    );
  }, [trajectories, query]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 pt-3 pb-2 flex-shrink-0">
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search callsign / ICAO…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-800 text-white text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1 scrollbar-thin">
        {filtered.length === 0 && (
          <p className="text-slate-500 text-xs text-center py-6">No routes match</p>
        )}
        {filtered.map((traj) => {
          const head = HeadPosition(traj, currentTime, timeRange);
          const isSelected = traj.icao24 === selectedFlightId;
          const altM = head?.baroAltitude ?? null;
          const altFt = altM !== null ? Math.round(altM * 3.28084) : null;
          const speedKts = head?.velocity ? Math.round(head.velocity * 1.94384) : null;
          const distKm = Math.round(trajectoryDistanceKm(traj));
          const distNm = Math.round(distKm * 0.539957);

          return (
            <button
              key={traj.icao24}
              onClick={() => onSelect(isSelected ? null : traj.icao24)}
              className={`w-full text-left rounded-xl p-3 transition-all group ${
                isSelected
                  ? "bg-blue-600/20 border border-blue-500/60 shadow-lg shadow-blue-900/20"
                  : "bg-slate-800/60 border border-transparent hover:bg-slate-800 hover:border-slate-600"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${isSelected ? "text-yellow-400" : "text-blue-400"}`}>
                    ✈
                  </span>
                  <span className="text-white font-mono font-bold text-sm">
                    {traj.callsign || traj.icao24}
                  </span>
                </div>
                {head?.onGround === false && (
                  <span className="text-green-400 text-xs">In Air</span>
                )}
                {head?.onGround && (
                  <span className="text-slate-500 text-xs">On Ground</span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-1 text-center">
                <Stat label="ALT" value={altFt !== null ? `${(altFt / 1000).toFixed(1)}k` : "—"} unit="ft" color={getProgressColor(altM)} />
                <Stat label="SPD" value={speedKts?.toString() ?? "—"} unit="kts" color="bg-indigo-400" />
                <Stat label="DIST" value={distNm.toString()} unit="nm" color="bg-violet-400" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Stat({
  label, value, unit, color,
}: { label: string; value: string; unit: string; color: string }) {
  return (
    <div className="bg-slate-900/60 rounded-lg px-1.5 py-1.5">
      <div className="flex items-center justify-center gap-1 mb-0.5">
        <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
        <span className="text-slate-500 text-[10px] uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-white font-mono text-xs font-semibold">{value}</div>
      <div className="text-slate-600 text-[9px]">{unit}</div>
    </div>
  );
}
