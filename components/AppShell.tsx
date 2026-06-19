"use client";

import { useEffect, useMemo, useCallback, useRef } from "react";
import MapView from "@/components/map/MapView";
import TimeSlider from "@/components/ui/TimeSlider";
import LayerToggle from "@/components/ui/LayerToggle";
import FlightDetailPanel from "@/components/ui/FlightDetailPanel";
import WeatherLegend from "@/components/ui/WeatherLegend";
import FlightList from "@/components/ui/FlightList";
import StatsPanel from "@/components/ui/StatsPanel";
import Toast from "@/components/ui/Toast";
import MapControls from "@/components/ui/MapControls";
import { useFlightStore } from "@/hooks/useFlightStore";
import { useWeatherStore } from "@/hooks/useWeatherStore";
import { useUIStore } from "@/hooks/useUIStore";
import { computeFlightStats } from "@/lib/geoUtils";
import { MOCK_AIRPORTS } from "@/lib/mockData";

const LIVE_REFRESH_MS = 30_000;

export default function AppShell() {
  const {
    trajectories,
    isLoading: flightsLoading,
    loadTrajectories,
    loadLiveFlights,
  } = useFlightStore();
  const { weatherPoints, loadWeather } = useWeatherStore();
  const {
    selectedFlightId,
    currentTime,
    timeRange,
    activeWeatherLayer,
    showFlightPaths,
    isPlaying,
    playbackSpeed,
    mapStyle,
    is3D,
    sidebarOpen,
    toasts,
    setSelectedFlight,
    setCurrentTime,
    setTimeRange,
    setActiveWeatherLayer,
    setShowFlightPaths,
    setIsPlaying,
    setPlaybackSpeed,
    setMapStyle,
    setIs3D,
    setSidebarOpen,
    addToast,
    removeToast,
  } = useUIStore();

  // Initial load
  useEffect(() => {
    loadTrajectories().then(() => addToast("Flight routes loaded", "success"));
    loadWeather().then(() => addToast("Weather data loaded", "info"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh live flights
  useEffect(() => {
    const id = setInterval(() => {
      loadLiveFlights();
    }, LIVE_REFRESH_MS);
    return () => clearInterval(id);
  }, [loadLiveFlights]);

  // Sync time range when trajectories load
  useEffect(() => {
    if (trajectories.length > 0) {
      const all = trajectories.flatMap((t) => t.path.map((p) => p.timestamp));
      const minT = Math.min(...all);
      const maxT = Math.max(...all);
      setTimeRange([minT, maxT]);
      setCurrentTime(1);
    }
  }, [trajectories, setTimeRange, setCurrentTime]);

  const selectedTrajectory = useMemo(
    () => trajectories.find((t) => t.icao24 === selectedFlightId) ?? null,
    [trajectories, selectedFlightId]
  );

  const stats = useMemo(() => computeFlightStats(trajectories), [trajectories]);

  const handlePlayToggle = useCallback(() => {
    if (currentTime >= 1) setCurrentTime(0);
    setIsPlaying(!isPlaying);
  }, [isPlaying, currentTime, setIsPlaying, setCurrentTime]);

  // Keyboard shortcuts
  const isPlayingRef = useRef(isPlaying);
  const currentTimeRef = useRef(currentTime);
  isPlayingRef.current = isPlaying;
  currentTimeRef.current = currentTime;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case " ":
          e.preventDefault();
          if (currentTimeRef.current >= 1) setCurrentTime(0);
          setIsPlaying(!isPlayingRef.current);
          break;
        case "r": case "R":
          setCurrentTime(0);
          setIsPlaying(false);
          break;
        case "Escape":
          setSelectedFlight(null);
          break;
        case "1":
          setActiveWeatherLayer("none");
          break;
        case "2":
          setActiveWeatherLayer("temperature");
          break;
        case "3":
          setActiveWeatherLayer("wind");
          break;
        case "4":
          setActiveWeatherLayer("precipitation");
          break;
        case "t": case "T":
          setIs3D(!is3D);
          break;
        case "b": case "B":
          setSidebarOpen(!sidebarOpen);
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [is3D, sidebarOpen, setCurrentTime, setIsPlaying, setSelectedFlight, setActiveWeatherLayer, setIs3D, setSidebarOpen]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-2 bg-slate-900/90 backdrop-blur border-b border-slate-800 z-20 flex-shrink-0">
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-sm shadow-lg">
            ✈️
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight">FPV Flight Tracker</h1>
            <p className="text-slate-500 text-xs leading-tight hidden sm:block">Historical paths + live weather</p>
          </div>
        </div>

        <div className="flex-1 px-2">
          <StatsPanel stats={stats} isLoading={flightsLoading} />
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {flightsLoading && (
            <div className="flex items-center gap-1.5 text-xs text-blue-400">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span>Loading…</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Toggle sidebar (B)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="text-slate-600 text-xs hidden lg:block leading-relaxed">
            <div>Space · Play/Pause</div>
            <div>R · Reset · Esc · Deselect</div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside
          className={`flex-shrink-0 bg-slate-900/95 border-r border-slate-800 flex flex-col overflow-hidden transition-all duration-300 ${
            sidebarOpen ? "w-72" : "w-0"
          }`}
        >
          {sidebarOpen && (
            <>
              <div className="px-3 pt-3 pb-2 flex-shrink-0 border-b border-slate-800">
                <LayerToggle
                  showFlightPaths={showFlightPaths}
                  activeWeatherLayer={activeWeatherLayer}
                  onToggleFlightPaths={() => setShowFlightPaths(!showFlightPaths)}
                  onSetWeatherLayer={setActiveWeatherLayer}
                />
              </div>

              <div className="flex-shrink-0 px-3 py-2 border-b border-slate-800">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Routes ({trajectories.length})
                </p>
              </div>

              <div className="flex-1 overflow-hidden">
                <FlightList
                  trajectories={trajectories}
                  selectedFlightId={selectedFlightId}
                  currentTime={currentTime}
                  timeRange={timeRange}
                  onSelect={setSelectedFlight}
                />
              </div>

              {selectedTrajectory && (
                <div className="flex-shrink-0 border-t border-slate-800 p-3">
                  <FlightDetailPanel
                    trajectory={selectedTrajectory}
                    onClose={() => setSelectedFlight(null)}
                  />
                </div>
              )}

              {activeWeatherLayer !== "none" && (
                <div className="flex-shrink-0 border-t border-slate-800 p-3">
                  <WeatherLegend activeLayer={activeWeatherLayer} />
                </div>
              )}
            </>
          )}
        </aside>

        {/* Map */}
        <main className="flex-1 relative overflow-hidden">
          <MapView
            trajectories={trajectories}
            weatherPoints={weatherPoints}
            airports={MOCK_AIRPORTS}
            currentTime={currentTime}
            timeRange={timeRange}
            activeWeatherLayer={activeWeatherLayer}
            showFlightPaths={showFlightPaths}
            selectedFlightId={selectedFlightId}
            mapStyle={mapStyle}
            is3D={is3D}
            onFlightSelect={setSelectedFlight}
          />

          {/* Map Controls (top-right) */}
          <div className="absolute top-3 right-3 z-10">
            <MapControls
              mapStyle={mapStyle}
              is3D={is3D}
              onMapStyleChange={setMapStyle}
              onToggle3D={() => setIs3D(!is3D)}
            />
          </div>

          {/* Timeline (bottom) */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-10">
            <TimeSlider
              currentTime={currentTime}
              isPlaying={isPlaying}
              playbackSpeed={playbackSpeed}
              onTimeChange={setCurrentTime}
              onPlayToggle={handlePlayToggle}
              onSpeedChange={setPlaybackSpeed}
              startTimestamp={timeRange[0]}
              endTimestamp={timeRange[1]}
            />
          </div>
        </main>
      </div>

      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
