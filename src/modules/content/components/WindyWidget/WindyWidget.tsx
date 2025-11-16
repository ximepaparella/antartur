import React from "react";
import styles from "./WindyWidget.module.scss";

interface WindyWidgetProps {
  /** Latitude for the map center */
  lat?: number;
  /** Longitude for the map center */
  lon?: number;
  /** Latitude for the detail view */
  detailLat?: number;
  /** Longitude for the detail view */
  detailLon?: number;
  /** Width in pixels. If provided, controls the visual width of the widget. If not provided, defaults to 100% width. */
  width?: number;
  /** Height in pixels. If provided, controls the visual height of the widget. If not provided, uses responsive CSS defaults (560px mobile, 650px desktop). */
  height?: number;
  /** Map zoom level */
  zoom?: number;
  /** Weather level (e.g., "surface") */
  level?: string;
  /** Overlay type (e.g., "wind") */
  overlay?: string;
  /** Weather product/model (e.g., "ecmwf") */
  product?: string;
}

export const WindyWidget: React.FC<WindyWidgetProps> = ({
  lat = -55.094,
  lon = -68.544,
  detailLat = -54.810,
  detailLon = -68.310,
  width,
  height,
  zoom = 8,
  level = "surface",
  overlay = "wind",
  product = "ecmwf",
}) => {
  // Use provided dimensions or fallback values for the embed URL
  const embedWidth = width || 650;
  const embedHeight = height || 560;
  
  const embedUrl = `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&detailLat=${detailLat}&detailLon=${detailLon}&width=${embedWidth}&height=${embedHeight}&zoom=${zoom}&level=${level}&overlay=${overlay}&product=${product}&menu=&message=true&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=true&metricWind=default&metricTemp=default&radarRange=-1`;

  // Build inline styles with CSS custom properties for dimensions
  const wrapperStyle: React.CSSProperties = {};
  if (width !== undefined) {
    wrapperStyle.width = `${width}px`;
  }
  if (height !== undefined) {
    wrapperStyle.height = `${height}px`;
  }

  return (
    <div className={styles.windyWidget} style={wrapperStyle}>
      <iframe
        src={embedUrl}
        className={styles.iframe}
        title="Mapa del clima - Windy"
        allow="geolocation"
      />
    </div>
  );
};

