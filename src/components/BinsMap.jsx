import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fillTone } from "../lib/format";

const TONE_COLORS = {
  ok: "#059669",
  warn: "#d97706",
  danger: "#e11d48",
  neutral: "#61736b",
};

function binMarkerIcon(bin) {
  const color = TONE_COLORS[fillTone(bin.lastFillLevel)];
  const label = bin.lastFillLevel != null ? `${bin.lastFillLevel}` : "?";

  return L.divIcon({
    className: "bin-marker-wrap",
    html: `<div class="bin-marker" style="background:${color}">${label}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
}

function FitBounds({ positions }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 15);
      return;
    }
    map.fitBounds(L.latLngBounds(positions), { padding: [48, 48] });
  }, [map, positions]);

  return null;
}

function BinsMap({ bins = [], route }) {
  const positions = useMemo(
    () =>
      bins
        .filter((b) => b.latitude != null && b.longitude != null)
        .map((b) => [b.latitude, b.longitude]),
    [bins]
  );

  // المسار الحقيقي عبر الطرق من الخادم، وإن تعذّر نرسم خطوطًا مستقيمة كبديل
  const routeCoords = useMemo(() => {
    if (route?.geometry?.length) return route.geometry;
    if (!route?.order) return [];

    const stops = route.order
      .map((binId) => {
        const bin = bins.find((b) => b.binId === binId);
        return bin ? [bin.latitude, bin.longitude] : null;
      })
      .filter(Boolean);

    // المسار دائري: نغلق الحلقة بالعودة إلى نقطة الانطلاق
    return stops.length > 1 ? [...stops, stops[0]] : [];
  }, [route, bins]);

  const usesRoads = Boolean(route?.geometry?.length);
  const center = positions[0] || [35.7, -0.63];

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <FitBounds positions={[...positions, ...routeCoords]} />

      {routeCoords.length > 1 && (
        <Polyline
          positions={routeCoords}
          pathOptions={{
            color: "#059669",
            weight: usesRoads ? 5 : 3,
            opacity: usesRoads ? 0.85 : 0.6,
            // الخط المتقطع يوضّح أن المسار تقديري وليس على الطرق
            dashArray: usesRoads ? undefined : "6 8",
          }}
        />
      )}

      {bins.map((bin) => (
        <Marker
          key={bin._id}
          position={[bin.latitude, bin.longitude]}
          icon={binMarkerIcon(bin)}
        >
          <Popup>
            <div className="map-popup__title">{bin.binId}</div>
            <div className="map-popup__row">
              <span>مستوى الامتلاء</span>
              <strong>
                {bin.lastFillLevel != null ? `${bin.lastFillLevel}%` : "—"}
              </strong>
            </div>
            <div className="map-popup__row">
              <span>الوزن</span>
              <strong>
                {bin.lastWeight != null ? `${bin.lastWeight} كغ` : "—"}
              </strong>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default BinsMap;
