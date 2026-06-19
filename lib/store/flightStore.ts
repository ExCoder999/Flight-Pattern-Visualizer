import { create } from "zustand";
import type { FlightTrajectory, FlightState } from "../types";

interface FlightStoreState {
  trajectories: FlightTrajectory[];
  liveFlights: FlightState[];
  isLoading: boolean;
  error: string | null;
  setTrajectories: (trajectories: FlightTrajectory[]) => void;
  setLiveFlights: (flights: FlightState[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useFlightStoreInternal = create<FlightStoreState>((set) => ({
  trajectories: [],
  liveFlights: [],
  isLoading: false,
  error: null,
  setTrajectories: (trajectories) => set({ trajectories }),
  setLiveFlights: (liveFlights) => set({ liveFlights }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
