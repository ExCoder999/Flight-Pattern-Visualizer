"use client";

import { useEffect, useMemo, useCallback } from "react";
import MapView from "@/components/map/MapView";
import TimeSlider from "@/components/ui/TimeSlider";
import LayerToggle from "@/components/ui/LayerToggle";
import FlightDetailPanel from "@/components/ui/FlightDetailPanel";
import WeatherLegend from "@/components/ui/WeatherLegend";
import { useFlightStore } from "@/hooks/useFlightStore";
import { useWeatherStore } from "@/hooks/useWeatherStore";
import { useUIStore } from "@/hooks/useUIStore";

export default function AppShell() {
  const { trajectories, isLoading: flightsLoading, loadTrajectories } = useFlightStore();
  const { weatherPoints, loadWeather } = useWeatherStore();
  const {
    selectedFlightId,
    currentTime,
    timeRange,
    activeWeatherLayer,
    showFlightPaths,
    isPlaying,
    setSelectedFlight,
    setCurrentTime,
    setTimeRange,
    setActiveWeatherLayer,
    setShowFlightPaths,
    setIsPlaying,
  } = useUIStore();

  useEffect(() => {
    loadTrajectories();
    loadWeather();
  }, [loadTrajectories, loadWeather]);

  useEffect(() => {
    if (trajectories.length > 0) {
      const allTimestamps = trajectories.flatMap((t) => t.path.map((p) => p.timestamp));
      const minT = Math.min(...allTimestamps);
      const maxT = Math.max(...allTimestamps);
      setTimeRange([minT, maxT]);
      setCurrentTime(1);
    }
  }, [trajectories, setTimeRange, setCurrentTime]);

  const selectedTrajectory = useMemo(
    () => trajectories.find((t) => t.icao24 === selectedFlightId) ?? null,
    [trajectories, selectedFlightId]
  );

  const globalStartTime = timeRange[0];
  const globalEndTime = timeRange[1];

  const handlePlayToggle = useCallback(() => {
    if (currentTime >= 1) {
      setCurrentTime(0);
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, currentTime, setIsPlaying, setCurrentTime]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden">
      <header className="flex items-center justify-between px-4 py-2 bg-slate-900/80 backdrop-blur border-b border-slate-800 z-20 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">✈️</span>
          <h1 className="font-bold text-base tracking-wide">FPV Flight Tracker</h1>
          <span className="text-slate-500 text-xs hidden sm:inline">Historical Paths + Weather</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {flightsLoading && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span>Loading flights…</span>
            </div>
          )}
          <span>{trajectories.length} routes</span>
          <span>•</span>
          <span>{weatherPoints.length} wx points</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <main className="flex-1 relative">
          <MapView
            trajectories={trajectories}
            weatherPoints={weatherPoints}
            currentTime={currentTime}
            timeRange={timeRange}
            activeWeatherLayer={activeWeatherLayer}
            showFlightPaths={showFlightPaths}
            selectedFlightId={selectedFlightId}
            onFlightSelect={setSelectedFlight}
          />
        </main>

        <aside className="absolute top-3 left-3 z-10 flex flex-col gap-3 w-64">
          <LayerToggle
            showFlightPaths={showFlightPaths}
            activeWeatherLayer={activeWeatherLayer}
            onToggleFlightPaths={() => setShowFlightPaths(!showFlightPaths)}
            onSetWeatherLayer={setActiveWeatherLayer}
          />

          {selectedTrajectory && (
            <FlightDetailPanel
              trajectory={selectedTrajectory}
              onClose={() => setSelectedFlight(null)}
            />
          )}

          {activeWeatherLayer !== "none" && (
            <WeatherLegend activeLayer={activeWeatherLayer} />
          )}
        </aside>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-10">
          <TimeSlider
            currentTime={currentTime}
            isPlaying={isPlaying}
            onTimeChange={setCurrentTime}
            onPlayToggle={handlePlayToggle}
            startTimestamp={globalStartTime}
            endTimestamp={globalEndTime}
          />
        </div>
      </div>
    </div>
  );
}
