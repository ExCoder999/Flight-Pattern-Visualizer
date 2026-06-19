"use client";

import type { MapStyle } from "@/lib/types";

interface MapControlsProps {
  mapStyle: MapStyle;
  is3D: boolean;
  isGlobe: boolean;
  onMapStyleChange: (style: MapStyle) => void;
  onToggle3D: () => void;
  onToggleGlobe: () => void;
}

const STYLES: { id: MapStyle; label: string; emoji: string; free?: true }[] = [
  { id: "dark",      label: "Dark",    emoji: "🌑", free: true },
  { id: "streets",   label: "Voyager", emoji: "🗺",  free: true },
  { id: "light",     label: "Light",   emoji: "☀️", free: true },
  { id: "satellite", label: "Terrain", emoji: "🌍", free: true },
];

export default function MapControls({
  mapStyle,
  is3D,
  isGlobe,
  onMapStyleChange,
  onToggle3D,
  onToggleGlobe,
}: MapControlsProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="bg-slate-900/90 backdrop-blur border border-slate-700 rounded-xl p-2 shadow-lg">
        <p className="text-slate-500 text-[10px] uppercase tracking-wider px-1 mb-1.5">Map Style</p>
        <div className="grid grid-cols-2 gap-1">
          {STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => onMapStyleChange(s.id)}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                mapStyle === s.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span>{s.emoji}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onToggleGlobe}
        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all shadow-lg ${
          isGlobe
            ? "bg-blue-600 border-blue-500 text-white"
            : "bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 backdrop-blur"
        }`}
        title="Toggle globe / flat (G)"
      >
        <span>{isGlobe ? "🌍" : "🗺"}</span>
        <span>{isGlobe ? "Globe" : "Flat"}</span>
      </button>

      <button
        onClick={onToggle3D}
        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all shadow-lg ${
          is3D
            ? "bg-indigo-600 border-indigo-500 text-white"
            : "bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 backdrop-blur"
        }`}
        title="Toggle 3D view (T)"
      >
        <span>🏔</span>
        <span>{is3D ? "3D On" : "3D View"}</span>
      </button>
    </div>
  );
}
