"use client";

import { useEffect, useRef, useCallback } from "react";
import type { PlaybackSpeed } from "@/lib/types";

interface TimeSliderProps {
  currentTime: number;
  isPlaying: boolean;
  playbackSpeed: PlaybackSpeed;
  onTimeChange: (time: number) => void;
  onPlayToggle: () => void;
  onSpeedChange: (speed: PlaybackSpeed) => void;
  startTimestamp: number;
  endTimestamp: number;
}

const SPEEDS: PlaybackSpeed[] = [0.5, 1, 2, 5];

function formatDateTime(unix: number): { date: string; time: string } {
  const d = new Date(unix * 1000);
  return {
    date: d.toLocaleDateString([], { month: "short", day: "numeric" }),
    time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

export default function TimeSlider({
  currentTime,
  isPlaying,
  playbackSpeed,
  onTimeChange,
  onPlayToggle,
  onSpeedChange,
  startTimestamp,
  endTimestamp,
}: TimeSliderProps) {
  const animFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const currentTimeRef = useRef(currentTime);
  const speedRef = useRef(playbackSpeed);
  currentTimeRef.current = currentTime;
  speedRef.current = playbackSpeed;

  const tick = useCallback(
    (ts: number) => {
      if (lastTimestampRef.current === null) lastTimestampRef.current = ts;
      const elapsed = ts - lastTimestampRef.current;
      lastTimestampRef.current = ts;
      const baseRate = 0.00006;
      const next = Math.min(1, currentTimeRef.current + elapsed * baseRate * speedRef.current);
      onTimeChange(next);
      if (next < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        onPlayToggle();
      }
    },
    [onTimeChange, onPlayToggle]
  );

  useEffect(() => {
    if (isPlaying) {
      lastTimestampRef.current = null;
      animFrameRef.current = requestAnimationFrame(tick);
    } else {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    }
    return () => {
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, tick]);

  const interpolated = startTimestamp + (endTimestamp - startTimestamp) * currentTime;
  const { date, time } = formatDateTime(interpolated);
  const startFmt = formatDateTime(startTimestamp);
  const endFmt = formatDateTime(endTimestamp);

  return (
    <div className="bg-slate-900/95 backdrop-blur border border-slate-700/80 rounded-2xl p-4 shadow-2xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? "bg-green-400 animate-pulse" : "bg-slate-500"}`} />
          <span className="text-white text-sm font-semibold">Timeline Replay</span>
        </div>
        <div className="text-right">
          <div className="text-white text-sm font-mono font-bold">{time}</div>
          <div className="text-slate-400 text-xs">{date}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => onTimeChange(0)}
          className="w-7 h-7 text-slate-400 hover:text-white transition-colors flex-shrink-0"
          title="Reset (R)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.333 4z" />
          </svg>
        </button>

        <button
          onClick={onPlayToggle}
          className="flex-shrink-0 w-10 h-10 bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-full flex items-center justify-center text-white transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label={isPlaying ? "Pause (Space)" : "Play (Space)"}
          title={isPlaying ? "Pause (Space)" : "Play (Space)"}
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="relative h-2 bg-slate-700 rounded-full group cursor-pointer">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-none"
              style={{ width: `${currentTime * 100}%` }}
            />
            <input
              type="range"
              min={0}
              max={1000}
              value={Math.round(currentTime * 1000)}
              onChange={(e) => onTimeChange(parseInt(e.target.value) / 1000)}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
            />
          </div>
          <div className="flex justify-between text-slate-500 text-xs mt-1.5">
            <span>{startFmt.time} {startFmt.date}</span>
            <span>{endFmt.time} {endFmt.date}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 justify-end">
        <span className="text-slate-500 text-xs mr-1">Speed</span>
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold transition-colors ${
              playbackSpeed === s
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
            }`}
          >
            {s}×
          </button>
        ))}
      </div>
    </div>
  );
}
