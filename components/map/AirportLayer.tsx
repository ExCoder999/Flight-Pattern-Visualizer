"use client";

import { Source, Layer } from "react-map-gl/mapbox";
import type {
  CircleLayerSpecification as CircleLayer,
  SymbolLayerSpecification as SymbolLayer,
} from "mapbox-gl";
import type { Airport, GeoJsonFeatureCollection } from "@/lib/types";
import { airportsToGeoJson } from "@/lib/geoUtils";

interface AirportLayerProps {
  airports: Airport[];
}

const airportCircleLayer: CircleLayer = {
  id: "airports",
  type: "circle",
  source: "airports-source",
  paint: {
    "circle-radius": 5,
    "circle-color": "#f8fafc",
    "circle-stroke-color": "#64748b",
    "circle-stroke-width": 1.5,
    "circle-opacity": 0.9,
  },
  minzoom: 3,
};

const airportLabelLayer: SymbolLayer = {
  id: "airport-labels",
  type: "symbol",
  source: "airports-source",
  layout: {
    "text-field": ["get", "icao"],
    "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Regular"],
    "text-size": 10,
    "text-offset": [0, 1.2],
    "text-anchor": "top",
    "text-optional": true,
  },
  paint: {
    "text-color": "#94a3b8",
    "text-halo-color": "#0f172a",
    "text-halo-width": 1,
  },
  minzoom: 4,
};

export default function AirportLayer({ airports }: AirportLayerProps) {
  const geoJson = airportsToGeoJson(airports) as unknown as GeoJSON.FeatureCollection;

  return (
    <Source id="airports-source" type="geojson" data={geoJson}>
      <Layer {...airportCircleLayer} />
      <Layer {...airportLabelLayer} />
    </Source>
  );
}
