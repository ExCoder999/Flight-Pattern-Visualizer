"use client";

import type { FlightStats } from "@/lib/types";

interface StatsPanelProps {
  stats: FlightStats;
  isLoading: boolean;
}

export default function StatsPanel({ stats, isLoading }: StatsPanelProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-800/60 rounded-xl p-3 animate-pulse">
            <div className="h-2 bg-slate-700 rounded mb-2 w-3/4" />
            <div className="h-5 bg-slate-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      <StatCard
        icon="🛫"
        label="Routes"
        value={stats.totalRoutes.toString()}
      />
      <StatCard
        icon="📏"
        label="Total Dist"
        value={`${stats.totalDistanceKm.toLocaleString()}`}
        unit="km"
      />
      <StatCard
        icon="💨"
        label="Avg Speed"
        value={stats.avgSpeedKts.toString()}
        unit="kts"
      />
      <StatCard
        icon="🏔"
        label="Max Alt"
        value={`${Math.round(stats.maxAltitudeFt / 1000).toString()}k`}
        unit="ft"
      />
    </div>
  );
}

function StatCard({
  icon, label, value, unit,
}: { icon: string; label: string; value: string; unit?: string }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5">
        <span className="text-sm">{icon}</span>
        <span className="text-slate-500 text-xs">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-white font-bold text-lg font-mono">{value}</span>
        {unit && <span className="text-slate-500 text-xs">{unit}</span>}
      </div>
    </div>
  );
}
