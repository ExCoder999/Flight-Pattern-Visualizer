"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import Map, {
  MapRef,
  MapMouseEvent,
  Popup,
  NavigationControl,
  ScaleControl,
} from "react-map-gl/maplibre";
import type { Map as MaplibreMap, ProjectionSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import FlightLayer from "./FlightLayer";
import WeatherLayer from "./WeatherLayer";
import AirportLayer from "./AirportLayer";
import WorldWeatherLayer from "./WorldWeatherLayer";
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
  dark:      "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  light:     "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  streets:   "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  satellite: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
};


interface PopupInfo {
  longitude: number;
  latitude: number;
  icao24: string;
  callsign: string;
  altitude: number | null;
  velocity: number | null;
  trueTrack: number | null;
  isLive?: boolean;
  originCountry?: string;
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
  isGlobe: boolean;
  onFlightSelect: (id: string | null) => void;
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
  isGlobe,
  onFlightSelect,
}: MapContainerProps) {
  const mapRef = useRef<MapRef>(null);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);

  const pathGeoJson: GeoJsonFeatureCollection = showFlightPaths
    ? trajectoriesToGeoJson(trajectories, currentTime, timeRange)
    : { type: "FeatureCollection", features: [] };

  const headsGeoJson: GeoJsonFeatureCollection = showFlightPaths
    ? flightHeadsToGeoJson(trajectories, currentTime, timeRange)
    : { type: "FeatureCollection", features: [] };

  const handleMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap() as MaplibreMap | undefined;
    if (!map) return;
    map.setProjection({ type: isGlobe ? "globe" : "mercator" } as ProjectionSpecification);
  }, [isGlobe]);

  // Re-apply projection whenever the map style or globe toggle changes.
  // We wait for 'idle' so setProjection() is safe to call.
  useEffect(() => {
    const map = mapRef.current?.getMap() as MaplibreMap | undefined;
    if (!map) return;
    const apply = () => {
      try {
        map.setProjection({ type: isGlobe ? "globe" : "mercator" } as ProjectionSpecification);
      } catch {
        // style not yet ready
      }
    };
    if (map.isStyleLoaded()) {
      apply();
    } else {
      map.once("idle", apply);
      return () => { map.off("idle", apply); };
    }
  }, [mapStyle, isGlobe]);

  useEffect(() => {
    const map = mapRef.current?.getMap() as MaplibreMap | undefined;
    if (!map) return;
    map.easeTo({ pitch: is3D ? 45 : 0, bearing: is3D ? -15 : 0, duration: 800 });
  }, [is3D]);

  useEffect(() => {
    if (!selectedFlightId) return;
    const traj = trajectories.find((t) => t.icao24 === selectedFlightId);
    if (!traj || traj.path.length === 0) return;
    const lons = traj.path.map((p) => p.longitude);
    const lats = traj.path.map((p) => p.latitude);
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lons) - 2, Math.min(...lats) - 2],
      [Math.max(...lons) + 2, Math.max(...lats) + 2],
    ];
    mapRef.current?.fitBounds(bounds, { padding: 80, duration: 900 });
  }, [selectedFlightId, trajectories]);

  const handleMapClick = useCallback(
    (event: MapMouseEvent) => {
      const map = mapRef.current?.getMap() as MaplibreMap | undefined;
      if (!map) return;
      const features = map.queryRenderedFeatures(event.point, {
        layers: ["flight-heads", "flight-paths"],
      });
      if (features.length > 0) {
        const f = features[0];
        const props = f.properties as Record<string, unknown>;
        const icao24 = String(props.icao24 ?? "");
        const isLive = f.layer.id === "live-flights";
        onFlightSelect(isLive ? null : icao24 === selectedFlightId ? null : icao24);
        const geometry = f.geometry as { type: string; coordinates: unknown };
        let lon = event.lngLat.lng;
        let lat = event.lngLat.lat;
        if (geometry.type === "Point") {
          const coords = geometry.coordinates as [number, number];
          [lon, lat] = coords;
        }
        setPopupInfo({
          longitude: lon,
          latitude: lat,
          icao24,
          callsign: String(props.callsign ?? ""),
          altitude: typeof props.altitude === "number" ? props.altitude : null,
          velocity: typeof props.velocity === "number" ? props.velocity : null,
          trueTrack: typeof props.trueTrack === "number" ? props.trueTrack : null,
          isLive,
          originCountry: typeof props.originCountry === "string" ? props.originCountry : undefined,
        });
      } else {
        onFlightSelect(null);
        setPopupInfo(null);
      }
    },
    [selectedFlightId, onFlightSelect]
  );

  return (
    <div className="relative w-full h-full">
      <Map
        ref={mapRef}
        initialViewState={{ longitude: 10, latitude: 25, zoom: 1.5, pitch: 0 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAP_STYLES[mapStyle]}
        onClick={handleMapClick}
        onLoad={handleMapLoad}
        cursor="crosshair"
        interactiveLayerIds={["flight-heads", "flight-paths"]}
        attributionControl={{ customAttribution: "© CARTO © OpenStreetMap" }}
      >
        <NavigationControl position="bottom-right" visualizePitch />
        <ScaleControl position="bottom-right" unit="imperial" />

        <AirportLayer airports={airports} />
        {/* World raster weather tiles (requires OWM key) */}
        <WorldWeatherLayer activeLayer={activeWeatherLayer} />
        {/* Dot overlay for weather fallback + specific values */}
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
            maxWidth="260px"
          >
            <div className="bg-slate-900 text-white rounded-lg p-3 text-sm shadow-2xl -mt-2 border border-slate-700">
              <div className="font-bold text-base mb-2 flex items-center gap-2">
                <span>{popupInfo.isLive ? "🛩" : "✈️"}</span>
                <span className={popupInfo.isLive ? "text-emerald-400" : "text-blue-400"}>
                  {popupInfo.callsign || popupInfo.icao24}
                  {popupInfo.isLive && (
                    <span className="ml-2 text-[10px] font-normal px-1.5 py-0.5 bg-emerald-900/60 border border-emerald-700 rounded-full align-middle">
                      LIVE
                    </span>
                  )}
                </span>
              </div>
              <div className="space-y-1 text-slate-300">
                <Row label="ICAO" value={popupInfo.icao24} mono />
                {popupInfo.originCountry && (
                  <Row label="Country" value={popupInfo.originCountry} />
                )}
                {popupInfo.altitude !== null && popupInfo.altitude > 0 && (
                  <Row label="Altitude" value={`${Math.round(popupInfo.altitude * 3.28084).toLocaleString()} ft`} />
                )}
                {popupInfo.velocity !== null && popupInfo.velocity > 0 && (
                  <Row label="Speed" value={`${Math.round(popupInfo.velocity * 1.94384)} kts`} />
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
