import React from "react";
import styles from "./WindyWidget.module.scss";

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

export const WindyWidget: React.FC<WindyWidgetProps> = ({
  lat = -55.094,
  lon = -68.544,
  detailLat = -54.810,
  detailLon = -68.310,
  width = 650,
  height = 560,
  zoom = 8,
  level = "surface",
  overlay = "wind",
  product = "ecmwf",
}) => {
  const embedUrl = `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&detailLat=${detailLat}&detailLon=${detailLon}&width=${width}&height=${height}&zoom=${zoom}&level=${level}&overlay=${overlay}&product=${product}&menu=&message=true&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=true&metricWind=default&metricTemp=default&radarRange=-1`;

  return (
    <div className={styles.windyWidget}>
      <iframe
        src={embedUrl}
        className={styles.iframe}
        title="Mapa del clima - Windy"
        allow="geolocation"
        frameBorder="0"
      />
    </div>
  );
};

