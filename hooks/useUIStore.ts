"use client";

/**
 * Abstraction layer over the UI state store.
 * Replace the Zustand adapter import to swap state libraries.
 */
import { useUIStoreInternal } from "@/lib/store/uiStore";
import type { WeatherLayerType } from "@/lib/types";

export function useUIStore() {
  const selectedFlightId = useUIStoreInternal((s) => s.selectedFlightId);
  const timeRange = useUIStoreInternal((s) => s.timeRange);
  const currentTime = useUIStoreInternal((s) => s.currentTime);
  const activeWeatherLayer = useUIStoreInternal((s) => s.activeWeatherLayer);
  const showFlightPaths = useUIStoreInternal((s) => s.showFlightPaths);
  const isPlaying = useUIStoreInternal((s) => s.isPlaying);
  const setSelectedFlight = useUIStoreInternal((s) => s.setSelectedFlight);
  const setTimeRange = useUIStoreInternal((s) => s.setTimeRange);
  const setCurrentTime = useUIStoreInternal((s) => s.setCurrentTime);
  const setActiveWeatherLayer = useUIStoreInternal((s) => s.setActiveWeatherLayer);
  const setShowFlightPaths = useUIStoreInternal((s) => s.setShowFlightPaths);
  const setIsPlaying = useUIStoreInternal((s) => s.setIsPlaying);

  return {
    selectedFlightId,
    timeRange,
    currentTime,
    activeWeatherLayer,
    showFlightPaths,
    isPlaying,
    setSelectedFlight,
    setTimeRange,
    setCurrentTime,
    setActiveWeatherLayer,
    setShowFlightPaths,
    setIsPlaying,
  } satisfies {
    selectedFlightId: string | null;
    timeRange: [number, number];
    currentTime: number;
    activeWeatherLayer: WeatherLayerType;
    showFlightPaths: boolean;
    isPlaying: boolean;
    setSelectedFlight: (id: string | null) => void;
    setTimeRange: (range: [number, number]) => void;
    setCurrentTime: (time: number) => void;
    setActiveWeatherLayer: (layer: WeatherLayerType) => void;
    setShowFlightPaths: (show: boolean) => void;
    setIsPlaying: (playing: boolean) => void;
  };
}
