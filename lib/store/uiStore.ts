import { create } from "zustand";
import type { WeatherLayerType, MapStyle, PlaybackSpeed, ToastMessage } from "../types";

interface UIStoreState {
  selectedFlightId: string | null;
  timeRange: [number, number];
  currentTime: number;
  activeWeatherLayer: WeatherLayerType;
  showFlightPaths: boolean;
  showLiveFlights: boolean;
  isPlaying: boolean;
  playbackSpeed: PlaybackSpeed;
  mapStyle: MapStyle;
  is3D: boolean;
  sidebarOpen: boolean;
  toasts: ToastMessage[];
  setSelectedFlight: (id: string | null) => void;
  setTimeRange: (range: [number, number]) => void;
  setCurrentTime: (time: number) => void;
  setActiveWeatherLayer: (layer: WeatherLayerType) => void;
  setShowFlightPaths: (show: boolean) => void;
  setShowLiveFlights: (show: boolean) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: PlaybackSpeed) => void;
  setMapStyle: (style: MapStyle) => void;
  setIs3D: (is3D: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  addToast: (message: string, type: ToastMessage["type"]) => void;
  removeToast: (id: string) => void;
}

export const useUIStoreInternal = create<UIStoreState>((set) => ({
  selectedFlightId: null,
  timeRange: [0, 1],
  currentTime: 0,
  activeWeatherLayer: "none",
  showFlightPaths: true,
  showLiveFlights: true,
  isPlaying: false,
  playbackSpeed: 1,
  mapStyle: "dark",
  is3D: false,
  sidebarOpen: true,
  toasts: [],
  setSelectedFlight: (selectedFlightId) => set({ selectedFlightId }),
  setTimeRange: (timeRange) => set({ timeRange }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setActiveWeatherLayer: (activeWeatherLayer) => set({ activeWeatherLayer }),
  setShowFlightPaths: (showFlightPaths) => set({ showFlightPaths }),
  setShowLiveFlights: (showLiveFlights) => set({ showLiveFlights }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
  setMapStyle: (mapStyle) => set({ mapStyle }),
  setIs3D: (is3D) => set({ is3D }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  addToast: (message, type) =>
    set((s) => ({
      toasts: [
        ...s.toasts.slice(-3),
        { id: `${Date.now()}-${Math.random()}`, message, type },
      ],
    })),
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
