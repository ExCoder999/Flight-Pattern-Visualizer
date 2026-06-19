"use client";

import { Source, Layer } from "react-map-gl/maplibre";
import type { WeatherPoint, WeatherLayerType, GeoJsonFeatureCollection } from "@/lib/types";

interface WeatherLayerProps {
  weatherPoints: WeatherPoint[];
  activeLayer: WeatherLayerType;
}

function weatherToGeoJson(
  points: WeatherPoint[],
  layer: WeatherLayerType
): GeoJsonFeatureCollection {
  return {
    type: "FeatureCollection",
    features: points.map((p) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [p.lon, p.lat] },
      properties: {
        temp: p.temp,
        windSpeed: p.windSpeed,
        windDeg: p.windDeg,
        precipitation: p.precipitation,
        humidity: p.humidity,
        description: p.description,
        icon: p.icon,
        feelsLike: p.feelsLike,
        displayValue:
          layer === "temperature"
            ? Math.round(p.temp)
            : layer === "wind"
            ? Math.round(p.windSpeed)
            : Math.round(p.precipitation * 10) / 10,
      },
    })),
  };
}

function getCircleColor(layer: WeatherLayerType): unknown {
  if (layer === "temperature") {
    return ["interpolate", ["linear"], ["get", "temp"],
      -20, "#0000ff", 0, "#00aaff", 10, "#00ffcc", 20, "#ffee00", 30, "#ff7700", 40, "#ff0000"];
  }
  if (layer === "wind") {
    return ["interpolate", ["linear"], ["get", "windSpeed"],
      0, "#a8edea", 5, "#54d2d2", 10, "#f7b733", 20, "#fc4a1a"];
  }
  if (layer === "precipitation") {
    return ["interpolate", ["linear"], ["get", "precipitation"],
      0, "#e0f0ff", 1, "#7ec8e3", 5, "#0070a1", 15, "#003366"];
  }
  return "#cccccc";
}

export default function WeatherLayer({ weatherPoints, activeLayer }: WeatherLayerProps) {
  if (activeLayer === "none" || weatherPoints.length === 0) return null;

  const geoJson = weatherToGeoJson(weatherPoints, activeLayer);

  return (
    <Source
      id="weather-source"
      type="geojson"
      data={geoJson as unknown as GeoJSON.FeatureCollection}
    >
      <Layer
        id="weather-circles"
        type="circle"
        source="weather-source"
        paint={{
          "circle-radius": [
            "interpolate", ["linear"], ["zoom"],
            3, 18, 6, 28, 10, 40,
          ] as unknown as number,
          "circle-color": getCircleColor(activeLayer) as string,
          "circle-opacity": 0.55,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 0.5,
        }}
      />
    </Source>
  );
}
