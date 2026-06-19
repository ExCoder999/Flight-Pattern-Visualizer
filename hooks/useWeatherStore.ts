"use client";

/**
 * Abstraction layer over the weather state store.
 * Replace the Zustand adapter import to swap state libraries.
 */
import { useCallback } from "react";
import { useWeatherStoreInternal } from "@/lib/store/weatherStore";
import type { WeatherPoint } from "@/lib/types";
import { fetchWeatherGrid } from "@/lib/api/weather";

export function useWeatherStore() {
  const weatherPoints = useWeatherStoreInternal((s) => s.weatherPoints);
  const isLoading = useWeatherStoreInternal((s) => s.isLoading);
  const error = useWeatherStoreInternal((s) => s.error);
  const setWeatherPoints = useWeatherStoreInternal((s) => s.setWeatherPoints);
  const setLoading = useWeatherStoreInternal((s) => s.setLoading);
  const setError = useWeatherStoreInternal((s) => s.setError);

  const loadWeather = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherGrid();
      setWeatherPoints(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load weather");
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setWeatherPoints]);

  return {
    weatherPoints,
    isLoading,
    error,
    loadWeather,
    setWeatherPoints,
  } satisfies {
    weatherPoints: WeatherPoint[];
    isLoading: boolean;
    error: string | null;
    loadWeather: () => Promise<void>;
    setWeatherPoints: (p: WeatherPoint[]) => void;
  };
}
