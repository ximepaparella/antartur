"use client";

import React from "react";
import dynamic from "next/dynamic";

interface WindyWidgetProps {
  lat?: number;
  lon?: number;
  detailLat?: number;
  detailLon?: number;
  width?: number;
  height?: number;
  zoom?: number;
  level?: string;
  overlay?: string;
  product?: string;
}

// Lazy load WindyWidget con ssr: false ya que usa iframe
const WindyWidgetDynamic = dynamic(
  () => import("./WindyWidget").then((mod) => ({ default: mod.WindyWidget })),
  {
    loading: () => (
      <div style={{ 
        width: "100%", 
        height: "560px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        background: "#f7f5f5" 
      }}>
        <p>Cargando mapa del clima...</p>
      </div>
    ),
    ssr: false, // WindyWidget usa iframe, no necesita SSR
  }
);

/**
 * Client Component wrapper para WindyWidget con lazy loading
 * 
 * Este componente maneja el dynamic import con ssr: false,
 * que solo es permitido en Client Components.
 */
export const WindyWidgetClient: React.FC<WindyWidgetProps> = (props) => {
  return <WindyWidgetDynamic {...props} />;
};

