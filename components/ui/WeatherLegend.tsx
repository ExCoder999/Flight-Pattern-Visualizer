"use client";

import type { WeatherLayerType } from "@/lib/types";

interface WeatherLegendProps {
  activeLayer: WeatherLayerType;
}

const LEGENDS: Record<
  Exclude<WeatherLayerType, "none">,
  { label: string; stops: Array<{ color: string; value: string }> }
> = {
  temperature: {
    label: "Temperature (°C)",
    stops: [
      { color: "#0000ff", value: "-20°" },
      { color: "#00aaff", value: "0°" },
      { color: "#00ffcc", value: "10°" },
      { color: "#ffee00", value: "20°" },
      { color: "#ff7700", value: "30°" },
      { color: "#ff0000", value: "40°" },
    ],
  },
  wind: {
    label: "Wind Speed (m/s)",
    stops: [
      { color: "#a8edea", value: "0" },
      { color: "#54d2d2", value: "5" },
      { color: "#f7b733", value: "10" },
      { color: "#fc4a1a", value: "20+" },
    ],
  },
  precipitation: {
    label: "Precipitation (mm/h)",
    stops: [
      { color: "#e0f0ff", value: "0" },
      { color: "#7ec8e3", value: "1" },
      { color: "#0070a1", value: "5" },
      { color: "#003366", value: "15+" },
    ],
  },
};

export default function WeatherLegend({ activeLayer }: WeatherLegendProps) {
  if (activeLayer === "none") return null;

  const legend = LEGENDS[activeLayer];

  return (
    <div className="bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg p-3 text-xs">
      <p className="text-slate-300 font-semibold mb-2">{legend.label}</p>
      <div className="flex items-center gap-0">
        {legend.stops.map((stop, i) => (
          <div key={i} className="flex flex-col items-center">
            <div
              className="w-6 h-4 rounded-sm"
              style={{ backgroundColor: stop.color }}
            />
            <span className="text-slate-400 mt-1">{stop.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
