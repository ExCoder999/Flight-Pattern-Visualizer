import { create } from "zustand";
import type { WeatherLayerType } from "../types";

interface UIStoreState {
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
}

export const useUIStoreInternal = create<UIStoreState>((set) => ({
  selectedFlightId: null,
  timeRange: [0, 1],
  currentTime: 0,
  activeWeatherLayer: "none",
  showFlightPaths: true,
  isPlaying: false,
  setSelectedFlight: (selectedFlightId) => set({ selectedFlightId }),
  setTimeRange: (timeRange) => set({ timeRange }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setActiveWeatherLayer: (activeWeatherLayer) => set({ activeWeatherLayer }),
  setShowFlightPaths: (showFlightPaths) => set({ showFlightPaths }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
}));
