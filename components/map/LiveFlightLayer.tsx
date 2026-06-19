"use client";

import { Source, Layer } from "react-map-gl/maplibre";
import type { FlightState, GeoJsonFeatureCollection } from "@/lib/types";

function liveToGeoJson(flights: FlightState[]): GeoJsonFeatureCollection {
  return {
    type: "FeatureCollection",
    features: flights
      .filter((f) => f.longitude !== null && f.latitude !== null && !f.onGround)
      .map((f) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [f.longitude!, f.latitude!] },
        properties: {
          icao24: f.icao24,
          callsign: f.callsign || f.icao24,
          altitude: f.baroAltitude ?? 0,
          velocity: f.velocity ?? 0,
          trueTrack: f.trueTrack ?? 0,
          originCountry: f.originCountry,
        },
      })),
  };
}

interface LiveFlightLayerProps {
  flights: FlightState[];
}

export default function LiveFlightLayer({ flights }: LiveFlightLayerProps) {
  const geoJson = liveToGeoJson(flights) as unknown as GeoJSON.FeatureCollection;

  return (
    <Source id="live-flights-source" type="geojson" data={geoJson}>
      {/* Airplane icon — image loaded by MapContainer on "styleimagemissing" */}
      <Layer
        id="live-flights"
        type="symbol"
        source="live-flights-source"
        layout={{
          "icon-image": "airplane-live",
          "icon-size": [
            "interpolate", ["linear"], ["zoom"],
            1, 0.35,
            4, 0.55,
            8, 0.85,
          ] as unknown as number,
          "icon-rotate": ["get", "trueTrack"] as unknown as number,
          "icon-rotation-alignment": "map",
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
          "text-field": [
            "step", ["zoom"], "",
            7, ["get", "callsign"],
          ] as unknown as string,
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "text-size": 10,
          "text-offset": [0, 1.5],
          "text-anchor": "top",
          "text-optional": true,
        }}
        paint={{
          "text-color": "#93c5fd",
          "text-halo-color": "#0f172a",
          "text-halo-width": 1.5,
        }}
      />
    </Source>
  );
}
