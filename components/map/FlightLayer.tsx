"use client";

import { Source, Layer } from "react-map-gl/mapbox";
import type {
  LineLayerSpecification as LineLayer,
  CircleLayerSpecification as CircleLayer,
  SymbolLayerSpecification as SymbolLayer,
} from "mapbox-gl";
import type { GeoJsonFeatureCollection } from "@/lib/types";

interface FlightLayerProps {
  pathGeoJson: GeoJsonFeatureCollection;
  headsGeoJson: GeoJsonFeatureCollection;
  selectedFlightId: string | null;
}

export default function FlightLayer({
  pathGeoJson,
  headsGeoJson,
  selectedFlightId,
}: FlightLayerProps) {
  const selectedId = selectedFlightId ?? "~~none~~";

  const pathLayer: LineLayer = {
    id: "flight-paths",
    type: "line",
    source: "flight-paths-source",
    layout: { "line-join": "round", "line-cap": "round" },
    paint: {
      "line-color": [
        "case",
        ["==", ["get", "icao24"], selectedId],
        "#facc15",
        [
          "interpolate",
          ["linear"],
          ["coalesce", ["get", "altitude"], 0],
          0,    "#1e3a5f",
          3000, "#1d4ed8",
          6000, "#06b6d4",
          9000, "#10b981",
          11000,"#f59e0b",
          12500,"#ef4444",
        ],
      ],
      "line-width": [
        "case",
        ["==", ["get", "icao24"], selectedId],
        4,
        2.5,
      ],
      "line-opacity": [
        "case",
        ["==", ["get", "icao24"], selectedId],
        1,
        0.8,
      ],
    },
  };

  const headsLayer: CircleLayer = {
    id: "flight-heads",
    type: "circle",
    source: "flight-heads-source",
    paint: {
      "circle-radius": [
        "case",
        ["==", ["get", "icao24"], selectedId],
        9,
        6,
      ],
      "circle-color": [
        "case",
        ["==", ["get", "icao24"], selectedId],
        "#facc15",
        "#3b82f6",
      ],
      "circle-stroke-color": [
        "case",
        ["==", ["get", "icao24"], selectedId],
        "#ffffff",
        "#0f172a",
      ],
      "circle-stroke-width": 2,
      "circle-opacity": 1,
    },
  };

  const callsignLayer: SymbolLayer = {
    id: "flight-callsigns",
    type: "symbol",
    source: "flight-heads-source",
    layout: {
      "text-field": ["get", "callsign"],
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 11,
      "text-offset": [0, 1.4],
      "text-anchor": "top",
      "text-optional": true,
    },
    paint: {
      "text-color": "#e2e8f0",
      "text-halo-color": "#0f172a",
      "text-halo-width": 1.5,
    },
    minzoom: 5,
  };

  return (
    <>
      <Source
        id="flight-paths-source"
        type="geojson"
        data={pathGeoJson as unknown as GeoJSON.FeatureCollection}
        lineMetrics
      >
        <Layer {...pathLayer} />
      </Source>
      <Source
        id="flight-heads-source"
        type="geojson"
        data={headsGeoJson as unknown as GeoJSON.FeatureCollection}
      >
        <Layer {...headsLayer} />
        <Layer {...callsignLayer} />
      </Source>
    </>
  );
}
