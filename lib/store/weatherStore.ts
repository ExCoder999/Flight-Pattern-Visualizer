import { create } from "zustand";
import type { WeatherPoint } from "../types";

interface WeatherStoreState {
  weatherPoints: WeatherPoint[];
  isLoading: boolean;
  error: string | null;
  setWeatherPoints: (points: WeatherPoint[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useWeatherStoreInternal = create<WeatherStoreState>((set) => ({
  weatherPoints: [],
  isLoading: false,
  error: null,
  setWeatherPoints: (weatherPoints) => set({ weatherPoints }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
