"use client";

/**
 * Abstraction layer over the UI state store.
 * Replace the Zustand adapter import to swap state libraries.
 */
import { useUIStoreInternal } from "@/lib/store/uiStore";
import type { WeatherLayerType, MapStyle, PlaybackSpeed, ToastMessage } from "@/lib/types";

export function useUIStore() {
  const selectedFlightId = useUIStoreInternal((s) => s.selectedFlightId);
  const timeRange = useUIStoreInternal((s) => s.timeRange);
  const currentTime = useUIStoreInternal((s) => s.currentTime);
  const activeWeatherLayer = useUIStoreInternal((s) => s.activeWeatherLayer);
  const showFlightPaths = useUIStoreInternal((s) => s.showFlightPaths);
  const isPlaying = useUIStoreInternal((s) => s.isPlaying);
  const playbackSpeed = useUIStoreInternal((s) => s.playbackSpeed);
  const mapStyle = useUIStoreInternal((s) => s.mapStyle);
  const is3D = useUIStoreInternal((s) => s.is3D);
  const sidebarOpen = useUIStoreInternal((s) => s.sidebarOpen);
  const toasts = useUIStoreInternal((s) => s.toasts);
  const setSelectedFlight = useUIStoreInternal((s) => s.setSelectedFlight);
  const setTimeRange = useUIStoreInternal((s) => s.setTimeRange);
  const setCurrentTime = useUIStoreInternal((s) => s.setCurrentTime);
  const setActiveWeatherLayer = useUIStoreInternal((s) => s.setActiveWeatherLayer);
  const setShowFlightPaths = useUIStoreInternal((s) => s.setShowFlightPaths);
  const setIsPlaying = useUIStoreInternal((s) => s.setIsPlaying);
  const setPlaybackSpeed = useUIStoreInternal((s) => s.setPlaybackSpeed);
  const setMapStyle = useUIStoreInternal((s) => s.setMapStyle);
  const setIs3D = useUIStoreInternal((s) => s.setIs3D);
  const setSidebarOpen = useUIStoreInternal((s) => s.setSidebarOpen);
  const addToast = useUIStoreInternal((s) => s.addToast);
  const removeToast = useUIStoreInternal((s) => s.removeToast);

  return {
    selectedFlightId,
    timeRange,
    currentTime,
    activeWeatherLayer,
    showFlightPaths,
    isPlaying,
    playbackSpeed,
    mapStyle,
    is3D,
    sidebarOpen,
    toasts,
    setSelectedFlight,
    setTimeRange,
    setCurrentTime,
    setActiveWeatherLayer,
    setShowFlightPaths,
    setIsPlaying,
    setPlaybackSpeed,
    setMapStyle,
    setIs3D,
    setSidebarOpen,
    addToast,
    removeToast,
  } satisfies {
    selectedFlightId: string | null;
    timeRange: [number, number];
    currentTime: number;
    activeWeatherLayer: WeatherLayerType;
    showFlightPaths: boolean;
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
    setIsPlaying: (playing: boolean) => void;
    setPlaybackSpeed: (speed: PlaybackSpeed) => void;
    setMapStyle: (style: MapStyle) => void;
    setIs3D: (is3D: boolean) => void;
    setSidebarOpen: (open: boolean) => void;
    addToast: (message: string, type: ToastMessage["type"]) => void;
    removeToast: (id: string) => void;
  };
}
