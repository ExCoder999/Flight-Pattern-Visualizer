"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type MapContainer from "./MapContainer";

const DynamicMapContainer = dynamic(() => import("./MapContainer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Loading map…</p>
        <p className="text-slate-600 text-xs mt-1">Powered by MapLibre + CARTO</p>
      </div>
    </div>
  ),
});

type MapViewProps = ComponentProps<typeof MapContainer>;

export default function MapView(props: MapViewProps) {
  return <DynamicMapContainer {...props} />;
}
