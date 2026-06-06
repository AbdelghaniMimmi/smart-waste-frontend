import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";

const binIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function BinsMap({ bins, route }) {
  // تحديد مركز افتراضي: أول حاوية أو إحداثية عامة للمدينة
  const defaultCenter =
    bins && bins.length > 0
      ? [bins[0].latitude, bins[0].longitude]
      : [35.7, -0.63]; // مثال: وهران

  // بناء polyline للمسار (قائمة نقاط lat/lng حسب order)
  let routeCoords = [];
  if (route && route.order && bins) {
    routeCoords = route.order
      .map((binId) => {
        const bin = bins.find((b) => b.binId === binId);
        if (!bin) return null;
        return [bin.latitude, bin.longitude];
      })
      .filter(Boolean);
  }

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {bins &&
        bins.map((bin) => (
          <Marker
            key={bin._id}
            position={[bin.latitude, bin.longitude]}
            icon={binIcon}
          >
            <Popup>
              <div>
                <strong>{bin.binId}</strong>
                <br />
                Fill: {bin.lastFillLevel ?? "-"} %
                <br />
                Weight: {bin.lastWeight ?? "-"} kg
              </div>
            </Popup>
          </Marker>
        ))}

      {routeCoords.length > 1 && (
        <Polyline positions={routeCoords} color="blue" />
      )}
    </MapContainer>
  );
}

export default BinsMap;