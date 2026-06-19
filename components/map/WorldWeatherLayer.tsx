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
  // Use owmLayer in the source/layer IDs so each weather type gets its own
  // MapLibre source — prevents "source already exists" error on layer switch.
  const sourceId = `owm-tiles-${owmLayer}`;
  const layerId  = `owm-raster-${owmLayer}`;

  return (
    <Source
      key={sourceId}
      id={sourceId}
      type="raster"
      tiles={[`/api/wx-tile/${owmLayer}/{z}/{x}/{y}`]}
      tileSize={256}
      minzoom={0}
      maxzoom={6}
      attribution="Weather data © OpenWeatherMap"
    >
      <Layer
        id={layerId}
        type="raster"
        source={sourceId}
        paint={{ "raster-opacity": 0.6 }}
      />
    </Source>
  );
}
