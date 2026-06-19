"use client";

import type { WeatherLayerType } from "@/lib/types";

interface LayerToggleProps {
  showFlightPaths: boolean;
  showLiveFlights: boolean;
  activeWeatherLayer: WeatherLayerType;
  onToggleFlightPaths: () => void;
  onToggleLiveFlights: () => void;
  onSetWeatherLayer: (layer: WeatherLayerType) => void;
}

const WEATHER_LAYERS: { id: WeatherLayerType; label: string; emoji: string }[] = [
  { id: "none", label: "Off", emoji: "⊘" },
  { id: "temperature", label: "Temp", emoji: "🌡" },
  { id: "wind", label: "Wind", emoji: "💨" },
  { id: "precipitation", label: "Rain", emoji: "🌧" },
];

export default function LayerToggle({
  showFlightPaths,
  showLiveFlights,
  activeWeatherLayer,
  onToggleFlightPaths,
  onToggleLiveFlights,
  onSetWeatherLayer,
}: LayerToggleProps) {
  return (
    <div className="bg-slate-900/95 backdrop-blur border border-slate-700 rounded-xl p-4 shadow-lg">
      <h3 className="text-white text-sm font-semibold mb-3">Layers</h3>

      <div className="space-y-3">
        <Toggle on={showLiveFlights} onClick={onToggleLiveFlights} label="Live Aircraft" color="emerald" />
        <Toggle on={showFlightPaths} onClick={onToggleFlightPaths} label="Flight Paths" color="blue" />

        <div>
          <p className="text-slate-400 text-xs mb-2">Global Weather Overlay</p>
          <div className="grid grid-cols-4 gap-1">
            {WEATHER_LAYERS.map((l) => (
              <button
                key={l.id}
                onClick={() => onSetWeatherLayer(l.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-colors ${
                  activeWeatherLayer === l.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <span className="text-base">{l.emoji}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({
  on, onClick, label, color,
}: { on: boolean; onClick: () => void; label: string; color: "blue" | "emerald" }) {
  const bg = on
    ? color === "emerald" ? "bg-emerald-600" : "bg-blue-600"
    : "bg-slate-600";
  const ring = color === "emerald" ? "focus:ring-emerald-400" : "focus:ring-blue-400";
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <button
        role="switch"
        aria-checked={on}
        onClick={onClick}
        className={`relative w-10 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 ${bg} ${ring}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            on ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      <span className="text-slate-300 text-sm group-hover:text-white transition-colors">
        {label}
      </span>
    </label>
  );
}
