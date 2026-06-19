"use client";

import { useEffect, useRef, useCallback } from "react";

interface TimeSliderProps {
  currentTime: number;
  isPlaying: boolean;
  onTimeChange: (time: number) => void;
  onPlayToggle: () => void;
  startTimestamp: number;
  endTimestamp: number;
}

function formatTimestamp(unix: number): string {
  return new Date(unix * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TimeSlider({
  currentTime,
  isPlaying,
  onTimeChange,
  onPlayToggle,
  startTimestamp,
  endTimestamp,
}: TimeSliderProps) {
  const animFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const currentTimeRef = useRef(currentTime);
  currentTimeRef.current = currentTime;

  const tick = useCallback(
    (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }
      const elapsed = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      const speed = 0.00008;
      const next = Math.min(1, currentTimeRef.current + elapsed * speed);
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
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, tick]);

  const interpolatedTimestamp =
    startTimestamp + (endTimestamp - startTimestamp) * currentTime;

  return (
    <div className="bg-slate-900/95 backdrop-blur border border-slate-700 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white text-sm font-semibold">Timeline Replay</h3>
        <span className="text-slate-400 text-xs font-mono">
          {formatTimestamp(interpolatedTimestamp)}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onPlayToggle}
          className="flex-shrink-0 w-9 h-9 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>

        <div className="flex-1">
          <input
            type="range"
            min={0}
            max={1000}
            value={Math.round(currentTime * 1000)}
            onChange={(e) => onTimeChange(parseInt(e.target.value) / 1000)}
            className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-slate-500 text-xs mt-1">
            <span>{formatTimestamp(startTimestamp)}</span>
            <span>{formatTimestamp(endTimestamp)}</span>
          </div>
        </div>

        <button
          onClick={() => onTimeChange(0)}
          className="flex-shrink-0 w-7 h-7 text-slate-400 hover:text-white transition-colors"
          aria-label="Reset"
          title="Reset to start"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
