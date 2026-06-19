"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import Map, {
  MapRef,
  MapMouseEvent,
  Popup,
  NavigationControl,
  ScaleControl,
} from "react-map-gl/maplibre";
import type { Map as MaplibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import FlightLayer from "./FlightLayer";
import WeatherLayer from "./WeatherLayer";
import AirportLayer from "./AirportLayer";
import LiveFlightLayer from "./LiveFlightLayer";
import WorldWeatherLayer from "./WorldWeatherLayer";
import type {
  FlightTrajectory,
  FlightState,
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

/** Draw airplane silhouette onto a canvas and return ImageData.
 *  Nose points north (up) so icon-rotate 0° = facing north. */
function createAirplaneImageData(size = 32): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const s = size / 32;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(size / 2, size / 2);

  ctx.shadowColor = "rgba(59, 130, 246, 0.55)";
  ctx.shadowBlur = 3 * s;
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.strokeStyle = "rgba(15, 23, 42, 0.7)";
  ctx.lineWidth = 0.9 * s;

  ctx.beginPath();
  ctx.moveTo(0,          -11 * s); // nose
  ctx.lineTo( 2   * s,   -5 * s);
  ctx.lineTo( 11  * s,    2 * s); // right wingtip
  ctx.lineTo( 9.5 * s,    4 * s);
  ctx.lineTo( 2.5 * s,  1.5 * s);
  ctx.lineTo( 3   * s,   10 * s); // right tail fin
  ctx.lineTo( 0,        8.5 * s); // tail notch
  ctx.lineTo(-3   * s,   10 * s); // left tail fin
  ctx.lineTo(-2.5 * s,  1.5 * s);
  ctx.lineTo(-9.5 * s,    4 * s);
  ctx.lineTo(-11  * s,    2 * s); // left wingtip
  ctx.lineTo(-2   * s,   -5 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
  return ctx.getImageData(0, 0, size, size);
}

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
  liveFlights: FlightState[];
  weatherPoints: WeatherPoint[];
  airports: Airport[];
  currentTime: number;
  timeRange: [number, number];
  activeWeatherLayer: WeatherLayerType;
  showFlightPaths: boolean;
  showLiveFlights: boolean;
  selectedFlightId: string | null;
  mapStyle: MapStyle;
  is3D: boolean;
  onFlightSelect: (id: string | null) => void;
}

export default function MapContainer({
  trajectories,
  liveFlights,
  weatherPoints,
  airports,
  currentTime,
  timeRange,
  activeWeatherLayer,
  showFlightPaths,
  showLiveFlights,
  selectedFlightId,
  mapStyle,
  is3D,
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

  // Register airplane icon — lazily on styleimagemissing so it survives style swaps
  const handleMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap() as MaplibreMap | undefined;
    if (!map) return;

    const provide = (e: { id: string }) => {
      if (e.id === "airplane-live" && !map.hasImage("airplane-live")) {
        map.addImage("airplane-live", createAirplaneImageData(32));
      }
    };

    map.on("styleimagemissing", provide);
    // Pre-load immediately so first render doesn't flash
    if (!map.hasImage("airplane-live")) {
      map.addImage("airplane-live", createAirplaneImageData(32));
    }
  }, []);

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
        layers: ["flight-heads", "flight-paths", "live-flights"],
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
        initialViewState={{ longitude: 10, latitude: 25, zoom: 2, pitch: 0 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAP_STYLES[mapStyle]}
        onClick={handleMapClick}
        onLoad={handleMapLoad}
        cursor="crosshair"
        interactiveLayerIds={["flight-heads", "flight-paths", "live-flights"]}
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
        {showLiveFlights && <LiveFlightLayer flights={liveFlights} />}

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
