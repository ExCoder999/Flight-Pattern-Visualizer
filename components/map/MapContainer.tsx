"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import Map, {
  MapRef,
  MapMouseEvent,
  Popup,
  NavigationControl,
  ScaleControl,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

import FlightLayer from "./FlightLayer";
import WeatherLayer from "./WeatherLayer";
import AirportLayer from "./AirportLayer";
import type {
  FlightTrajectory,
  WeatherPoint,
  WeatherLayerType,
  MapStyle,
  Airport,
  GeoJsonFeatureCollection,
} from "@/lib/types";
import { trajectoriesToGeoJson, flightHeadsToGeoJson } from "@/lib/geoUtils";

const MAP_STYLES: Record<MapStyle, string> = {
  dark:      "mapbox://styles/mapbox/dark-v11",
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
  light:     "mapbox://styles/mapbox/light-v11",
  streets:   "mapbox://styles/mapbox/streets-v12",
};

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
  airports: Airport[];
  currentTime: number;
  timeRange: [number, number];
  activeWeatherLayer: WeatherLayerType;
  showFlightPaths: boolean;
  selectedFlightId: string | null;
  mapStyle: MapStyle;
  is3D: boolean;
  onFlightSelect: (id: string | null) => void;
}

function NoTokenFallback({
  trajectories,
  weatherPoints,
  selectedFlightId,
  onFlightSelect,
}: Pick<MapContainerProps, "trajectories" | "weatherPoints" | "selectedFlightId" | "onFlightSelect">) {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="absolute inset-0 opacity-10">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-400"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
      <div className="relative text-center text-white max-w-md px-6 z-10">
        <div className="text-7xl mb-5 filter drop-shadow-lg">✈️</div>
        <h2 className="text-2xl font-bold mb-2">Map Preview Mode</h2>
        <p className="text-slate-400 mb-5 text-sm leading-relaxed">
          The interactive Mapbox map requires a token. Flight data is fully loaded — click any route below.
        </p>
        <pre className="bg-slate-800/80 text-green-400 text-xs p-3 rounded-lg text-left mb-5 border border-slate-700">
          {`# .env.local\nNEXT_PUBLIC_MAPBOX_TOKEN=pk.ey...`}
        </pre>
        <div className="flex gap-4 text-xs text-slate-400 justify-center mb-6">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full inline-block" />
            {trajectories.length} routes loaded
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
            {weatherPoints.length} wx points
          </span>
        </div>
        <div className="space-y-2 text-left">
          {trajectories.map((t) => (
            <button
              key={t.icao24}
              onClick={() => onFlightSelect(t.icao24 === selectedFlightId ? null : t.icao24)}
              className={`w-full flex items-center gap-3 rounded-lg p-3 text-sm transition-all ${
                t.icao24 === selectedFlightId
                  ? "bg-blue-600/30 border border-blue-500/50 text-blue-300"
                  : "bg-slate-800/60 border border-slate-700 hover:bg-slate-700/60 text-slate-200"
              }`}
            >
              <span className="text-base">✈️</span>
              <span className="font-mono font-bold">{t.callsign || t.icao24}</span>
              <span className="text-slate-400 text-xs ml-auto">{t.path.length} pts</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MapContainer({
  trajectories,
  weatherPoints,
  airports,
  currentTime,
  timeRange,
  activeWeatherLayer,
  showFlightPaths,
  selectedFlightId,
  mapStyle,
  is3D,
  onFlightSelect,
}: MapContainerProps) {
  const mapRef = useRef<MapRef>(null);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const isValidToken = !!token;

  const pathGeoJson: GeoJsonFeatureCollection = showFlightPaths
    ? trajectoriesToGeoJson(trajectories, currentTime, timeRange)
    : { type: "FeatureCollection", features: [] };

  const headsGeoJson: GeoJsonFeatureCollection = showFlightPaths
    ? flightHeadsToGeoJson(trajectories, currentTime, timeRange)
    : { type: "FeatureCollection", features: [] };

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    map.easeTo({
      pitch: is3D ? 45 : 0,
      bearing: is3D ? -15 : 0,
      duration: 800,
    });
  }, [is3D]);

  useEffect(() => {
    if (selectedFlightId && isValidToken) {
      const traj = trajectories.find((t) => t.icao24 === selectedFlightId);
      if (!traj || traj.path.length === 0) return;
      const lons = traj.path.map((p) => p.longitude);
      const lats = traj.path.map((p) => p.latitude);
      const bounds: [[number, number], [number, number]] = [
        [Math.min(...lons) - 1, Math.min(...lats) - 1],
        [Math.max(...lons) + 1, Math.max(...lats) + 1],
      ];
      mapRef.current?.fitBounds(bounds, { padding: 60, duration: 900 });
    }
  }, [selectedFlightId, trajectories, isValidToken]);

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
      <NoTokenFallback
        trajectories={trajectories}
        weatherPoints={weatherPoints}
        selectedFlightId={selectedFlightId}
        onFlightSelect={onFlightSelect}
      />
    );
  }

  return (
    <div className="relative w-full h-full">
      <Map
        ref={mapRef}
        mapboxAccessToken={token}
        initialViewState={{ longitude: -96, latitude: 39, zoom: 4, pitch: 0 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAP_STYLES[mapStyle]}
        onClick={handleMapClick}
        cursor="crosshair"
        interactiveLayerIds={["flight-heads", "flight-paths"]}
      >
        <NavigationControl position="bottom-right" visualizePitch />
        <ScaleControl position="bottom-right" unit="imperial" />

        <AirportLayer airports={airports} />
        <WeatherLayer weatherPoints={weatherPoints} activeLayer={activeWeatherLayer} />
        <FlightLayer
          pathGeoJson={pathGeoJson}
          headsGeoJson={headsGeoJson}
          selectedFlightId={selectedFlightId}
        />

        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            anchor="bottom"
            onClose={() => setPopupInfo(null)}
            closeOnClick={false}
            className="flight-popup"
            maxWidth="240px"
          >
            <div className="bg-slate-900 text-white rounded-lg p-3 text-sm shadow-2xl -mt-2">
              <div className="font-bold text-blue-400 text-base mb-2 flex items-center gap-2">
                <span>✈️</span>
                <span>{popupInfo.callsign || popupInfo.icao24}</span>
              </div>
              <div className="space-y-1 text-slate-300">
                <Row label="ICAO" value={popupInfo.icao24} mono />
                {popupInfo.altitude !== null && (
                  <Row
                    label="Altitude"
                    value={`${Math.round(popupInfo.altitude * 3.28084).toLocaleString()} ft`}
                  />
                )}
                {popupInfo.velocity !== null && (
                  <Row
                    label="Speed"
                    value={`${Math.round(popupInfo.velocity * 1.94384)} kts`}
                  />
                )}
                {popupInfo.trueTrack !== null && (
                  <Row label="Heading" value={`${Math.round(popupInfo.trueTrack)}°`} />
                )}
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500 text-xs">{label}</span>
      <span className={`text-white text-xs font-medium ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
