"use client";

import { Source, Layer } from "react-map-gl/mapbox";
import type { LineLayerSpecification as LineLayer, CircleLayerSpecification as CircleLayer } from "mapbox-gl";
import type { GeoJsonFeatureCollection } from "@/lib/types";

interface FlightLayerProps {
  pathGeoJson: GeoJsonFeatureCollection;
  headsGeoJson: GeoJsonFeatureCollection;
  selectedFlightId: string | null;
  onFlightClick: (icao24: string) => void;
}

const pathLayer: LineLayer = {
  id: "flight-paths",
  type: "line",
  source: "flight-paths-source",
  layout: { "line-join": "round", "line-cap": "round" },
  paint: {
    "line-color": [
      "case",
      ["==", ["get", "icao24"], "SELECTED_PLACEHOLDER"],
      "#facc15",
      "#60a5fa",
    ],
    "line-width": ["case", ["==", ["get", "icao24"], "SELECTED_PLACEHOLDER"], 4, 2],
    "line-opacity": 0.85,
  },
};

const headsLayer: CircleLayer = {
  id: "flight-heads",
  type: "circle",
  source: "flight-heads-source",
  paint: {
    "circle-radius": 6,
    "circle-color": [
      "case",
      ["==", ["get", "icao24"], "SELECTED_PLACEHOLDER"],
      "#facc15",
      "#3b82f6",
    ],
    "circle-stroke-color": "#ffffff",
    "circle-stroke-width": 1.5,
  },
};

export default function FlightLayer({
  pathGeoJson,
  headsGeoJson,
  selectedFlightId,
  onFlightClick,
}: FlightLayerProps) {
  const selectedId = selectedFlightId ?? "~~none~~";

  const resolvedPathLayer: LineLayer = {
    ...pathLayer,
    paint: {
      ...pathLayer.paint,
      "line-color": [
        "case",
        ["==", ["get", "icao24"], selectedId],
        "#facc15",
        "#60a5fa",
      ],
      "line-width": ["case", ["==", ["get", "icao24"], selectedId], 4, 2],
    },
  };

  const resolvedHeadsLayer: CircleLayer = {
    ...headsLayer,
    paint: {
      ...headsLayer.paint,
      "circle-color": [
        "case",
        ["==", ["get", "icao24"], selectedId],
        "#facc15",
        "#3b82f6",
      ],
    },
  };

  return (
    <>
      <Source
        id="flight-paths-source"
        type="geojson"
        data={pathGeoJson as unknown as GeoJSON.FeatureCollection}
      >
        <Layer {...resolvedPathLayer} />
      </Source>
      <Source
        id="flight-heads-source"
        type="geojson"
        data={headsGeoJson as unknown as GeoJSON.FeatureCollection}
      >
        <Layer {...resolvedHeadsLayer} />
      </Source>
    </>
  );
}
