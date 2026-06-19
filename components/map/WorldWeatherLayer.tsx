"use client";

import { Source, Layer } from "react-map-gl/maplibre";
import type { WeatherLayerType } from "@/lib/types";

const OWM_LAYER: Record<Exclude<WeatherLayerType, "none">, string> = {
  temperature:   "temp_new",
  wind:          "wind_new",
  precipitation: "precipitation_new",
};

interface WorldWeatherLayerProps {
  activeLayer: WeatherLayerType;
}

export default function WorldWeatherLayer({ activeLayer }: WorldWeatherLayerProps) {
  if (activeLayer === "none") return null;

  const owmLayer = OWM_LAYER[activeLayer as Exclude<WeatherLayerType, "none">];

  return (
    <Source
      key={owmLayer}
      id="owm-tiles"
      type="raster"
      tiles={[`/api/wx-tile/${owmLayer}/{z}/{x}/{y}`]}
      tileSize={256}
      minzoom={0}
      maxzoom={6}
      attribution="Weather data © OpenWeatherMap"
    >
      <Layer
        id="owm-raster"
        type="raster"
        source="owm-tiles"
        paint={{ "raster-opacity": 0.6 }}
      />
    </Source>
  );
}
