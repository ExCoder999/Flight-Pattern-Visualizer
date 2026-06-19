"use client";

import { Source, Layer } from "react-map-gl/maplibre";
import type { Airport } from "@/lib/types";
import { airportsToGeoJson } from "@/lib/geoUtils";

interface AirportLayerProps {
  airports: Airport[];
}

export default function AirportLayer({ airports }: AirportLayerProps) {
  const geoJson = airportsToGeoJson(airports) as unknown as GeoJSON.FeatureCollection;

  return (
    <Source id="airports-source" type="geojson" data={geoJson}>
      <Layer
        id="airports"
        type="circle"
        source="airports-source"
        minzoom={3}
        paint={{
          "circle-radius": 5,
          "circle-color": "#f8fafc",
          "circle-stroke-color": "#64748b",
          "circle-stroke-width": 1.5,
          "circle-opacity": 0.9,
        }}
      />
      <Layer
        id="airport-labels"
        type="symbol"
        source="airports-source"
        minzoom={4}
        layout={{
          "text-field": ["get", "icao"],
          "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
          "text-size": 10,
          "text-offset": [0, 1.2],
          "text-anchor": "top",
          "text-optional": true,
        }}
        paint={{
          "text-color": "#94a3b8",
          "text-halo-color": "#0f172a",
          "text-halo-width": 1,
        }}
      />
    </Source>
  );
}
