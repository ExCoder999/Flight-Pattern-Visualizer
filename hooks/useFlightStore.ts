"use client";

/**
 * Abstraction layer over the flight state store.
 * Swap the underlying library by replacing the import below —
 * all components using this hook require zero changes.
 *
 * Current adapter: Zustand (lib/store/flightStore.ts)
 * To switch: implement the same interface with Redux / Jotai / etc.
 */
import { useCallback } from "react";
import { useFlightStoreInternal } from "@/lib/store/flightStore";
import type { FlightTrajectory, FlightState } from "@/lib/types";
import { fetchHistoricalTrajectories, fetchLiveFlights } from "@/lib/api/flights";

export function useFlightStore() {
  const trajectories = useFlightStoreInternal((s) => s.trajectories);
  const liveFlights = useFlightStoreInternal((s) => s.liveFlights);
  const isLoading = useFlightStoreInternal((s) => s.isLoading);
  const error = useFlightStoreInternal((s) => s.error);
  const setTrajectories = useFlightStoreInternal((s) => s.setTrajectories);
  const setLiveFlights = useFlightStoreInternal((s) => s.setLiveFlights);
  const setLoading = useFlightStoreInternal((s) => s.setLoading);
  const setError = useFlightStoreInternal((s) => s.setError);

  const loadTrajectories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHistoricalTrajectories();
      setTrajectories(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load flights");
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setTrajectories]);

  const loadLiveFlights = useCallback(async () => {
    try {
      const data = await fetchLiveFlights();
      setLiveFlights(data);
    } catch {
      // silently ignore live update failures
    }
  }, [setLiveFlights]);

  return {
    trajectories,
    liveFlights,
    isLoading,
    error,
    loadTrajectories,
    loadLiveFlights,
    setTrajectories,
    setLiveFlights,
  } satisfies {
    trajectories: FlightTrajectory[];
    liveFlights: FlightState[];
    isLoading: boolean;
    error: string | null;
    loadTrajectories: () => Promise<void>;
    loadLiveFlights: () => Promise<void>;
    setTrajectories: (t: FlightTrajectory[]) => void;
    setLiveFlights: (f: FlightState[]) => void;
  };
}
