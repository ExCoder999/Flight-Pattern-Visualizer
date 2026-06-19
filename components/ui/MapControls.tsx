"use client";

import type { MapStyle } from "@/lib/types";

interface MapControlsProps {
  mapStyle: MapStyle;
  is3D: boolean;
  onMapStyleChange: (style: MapStyle) => void;
  onToggle3D: () => void;
}

const STYLES: { id: MapStyle; label: string; emoji: string }[] = [
  { id: "dark",      label: "Dark",      emoji: "🌑" },
  { id: "satellite", label: "Satellite", emoji: "🛰" },
  { id: "light",     label: "Light",     emoji: "☀️" },
  { id: "streets",   label: "Streets",   emoji: "🗺" },
];

export default function MapControls({
  mapStyle,
  is3D,
  onMapStyleChange,
  onToggle3D,
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
        onClick={onToggle3D}
        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all shadow-lg ${
          is3D
            ? "bg-indigo-600 border-indigo-500 text-white"
            : "bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 backdrop-blur"
        }`}
        title="Toggle 3D view (3)"
      >
        <span>🏔</span>
        <span>{is3D ? "3D On" : "3D View"}</span>
      </button>
    </div>
  );
}
