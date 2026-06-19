"use client";

import { useCallback, useRef, useState } from "react";
import Map, { MapRef, MapMouseEvent } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

import FlightLayer from "./FlightLayer";
import WeatherLayer from "./WeatherLayer";
import type { FlightTrajectory, WeatherPoint, WeatherLayerType, GeoJsonFeatureCollection } from "@/lib/types";
import { trajectoriesToGeoJson, flightHeadsToGeoJson } from "@/lib/geoUtils";

const FALLBACK_STYLE = "mapbox://styles/mapbox/dark-v11";
const MOCK_TOKEN = "pk.eyJ1IjoiZGVtb3VzZXIiLCJhIjoiY2tkZW1vMDAwMDAwMDMybW9ja3Rva2VuMTIzIn0.INVALID_MOCK_TOKEN";

interface PopupInfo {
  longitude: number;
  latitude: number;
  icao24: string;
  callsign: string;
  altitude: number | null;
  velocity: number | null;
  trueTrack: number | null;
}

interface MapContainerProps {
  trajectories: FlightTrajectory[];
  weatherPoints: WeatherPoint[];
  currentTime: number;
  timeRange: [number, number];
  activeWeatherLayer: WeatherLayerType;
  showFlightPaths: boolean;
  selectedFlightId: string | null;
  onFlightSelect: (id: string | null) => void;
}

export default function MapContainer({
  trajectories,
  weatherPoints,
  currentTime,
  timeRange,
  activeWeatherLayer,
  showFlightPaths,
  selectedFlightId,
  onFlightSelect,
}: MapContainerProps) {
  const mapRef = useRef<MapRef>(null);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? MOCK_TOKEN;
  const isValidToken = !!(process.env.NEXT_PUBLIC_MAPBOX_TOKEN);

  const pathGeoJson: GeoJsonFeatureCollection = showFlightPaths
    ? trajectoriesToGeoJson(trajectories, currentTime, timeRange)
    : { type: "FeatureCollection", features: [] };

  const headsGeoJson: GeoJsonFeatureCollection = showFlightPaths
    ? flightHeadsToGeoJson(trajectories, currentTime, timeRange)
    : { type: "FeatureCollection", features: [] };

  const handleMapClick = useCallback(
    (event: MapMouseEvent) => {
      const map = mapRef.current?.getMap();
      if (!map) return;

      const features = map.queryRenderedFeatures(event.point, {
        layers: ["flight-heads", "flight-paths"],
      });

      if (features.length > 0) {
        const f = features[0];
        const props = f.properties as Record<string, unknown>;
        const icao24 = String(props.icao24 ?? "");
        onFlightSelect(icao24 === selectedFlightId ? null : icao24);

        const geometry = f.geometry as { type: string; coordinates: unknown };
        let lon = event.lngLat.lng;
        let lat = event.lngLat.lat;

        if (geometry.type === "Point") {
          const coords = geometry.coordinates as [number, number];
          lon = coords[0];
          lat = coords[1];
        }

        setPopupInfo({
          longitude: lon,
          latitude: lat,
          icao24,
          callsign: String(props.callsign ?? ""),
          altitude: typeof props.altitude === "number" ? props.altitude : null,
          velocity: typeof props.velocity === "number" ? props.velocity : null,
          trueTrack: typeof props.trueTrack === "number" ? props.trueTrack : null,
        });
      } else {
        onFlightSelect(null);
        setPopupInfo(null);
      }
    },
    [selectedFlightId, onFlightSelect]
  );

  if (!isValidToken) {
    return (
      <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white max-w-md px-6">
          <div className="text-6xl mb-4">✈️</div>
          <h2 className="text-2xl font-bold mb-3">Map Preview Unavailable</h2>
          <p className="text-slate-300 mb-4">
            Add your Mapbox token to <code className="bg-slate-700 px-1 rounded">.env.local</code> to
            render the interactive map.
          </p>
          <pre className="bg-slate-800 text-green-400 text-xs p-3 rounded text-left">
            {`NEXT_PUBLIC_MAPBOX_TOKEN=pk.ey...`}
          </pre>
          <p className="text-slate-400 text-sm mt-4">
            {trajectories.length} flight trajectories loaded •{" "}
            {weatherPoints.length} weather points loaded
          </p>
          <div className="mt-6 grid grid-cols-1 gap-2 text-left">
            {trajectories.map((t) => (
              <div
                key={t.icao24}
                className="bg-slate-800 rounded p-3 cursor-pointer hover:bg-slate-700 transition-colors"
                onClick={() =>
                  onFlightSelect(t.icao24 === selectedFlightId ? null : t.icao24)
                }
              >
                <span className="font-mono font-bold text-blue-400">{t.callsign || t.icao24}</span>
                <span className="text-slate-400 text-xs ml-2">
                  {t.path.length} waypoints
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Map
        ref={mapRef}
        mapboxAccessToken={token}
        initialViewState={{
          longitude: -96,
          latitude: 38,
          zoom: 4,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={FALLBACK_STYLE}
        onClick={handleMapClick}
        cursor="crosshair"
        interactiveLayerIds={["flight-heads", "flight-paths"]}
      >
        <WeatherLayer weatherPoints={weatherPoints} activeLayer={activeWeatherLayer} />
        <FlightLayer
          pathGeoJson={pathGeoJson}
          headsGeoJson={headsGeoJson}
          selectedFlightId={selectedFlightId}
          onFlightClick={onFlightSelect}
        />
      </Map>

      {popupInfo && (
        <div
          className="absolute bg-slate-900/95 backdrop-blur border border-slate-700 rounded-lg p-3 text-white text-sm shadow-xl pointer-events-none z-10"
          style={{
            left: "50%",
            bottom: "1rem",
            transform: "translateX(-50%)",
            minWidth: "200px",
          }}
        >
          <div className="font-bold text-blue-400 text-base mb-1">
            {popupInfo.callsign || popupInfo.icao24}
          </div>
          <div className="text-slate-300 space-y-0.5">
            <div>ICAO: <span className="text-white font-mono">{popupInfo.icao24}</span></div>
            {popupInfo.altitude !== null && (
              <div>Altitude: <span className="text-white">{Math.round(popupInfo.altitude)}m</span></div>
            )}
            {popupInfo.velocity !== null && (
              <div>Speed: <span className="text-white">{Math.round(popupInfo.velocity)} m/s</span></div>
            )}
            {popupInfo.trueTrack !== null && (
              <div>Heading: <span className="text-white">{Math.round(popupInfo.trueTrack)}°</span></div>
            )}
          </div>
          <button
            className="pointer-events-auto mt-2 text-xs text-slate-500 hover:text-slate-300"
            onClick={() => setPopupInfo(null)}
          >
            dismiss
          </button>
        </div>
      )}
    </div>
  );
}
