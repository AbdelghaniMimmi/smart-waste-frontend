import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CrosshairIcon, ExternalLinkIcon } from "./Icons";
import {
  googleMapsUrl,
  isShortGoogleLink,
  parseGoogleMapsInput,
  roundCoord,
} from "../lib/geo";

const LAYERS = {
  streets: {
    label: "شوارع",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
  },
  satellite: {
    label: "قمر صناعي",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
  },
};

const pinIcon = L.divIcon({
  className: "bin-marker-wrap",
  html: '<div class="pick-marker"></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

function ClickToPick({ onPick }) {
  useMapEvents({
    click: (e) => onPick(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

// يحرّك الخريطة نحو الموضع إن خرج عن الجزء الظاهر (عند الكتابة أو اللصق)
function FollowPosition({ position }) {
  const map = useMap();

  useEffect(() => {
    // الخريطة داخل نافذة منبثقة متحرّكة، فنعيد حساب حجمها بعد ظهورها
    const timer = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (position && !map.getBounds().contains(position)) {
      map.setView(position, Math.max(map.getZoom(), 15));
    }
  }, [map, position]);

  return null;
}

function LocationPicker({ latitude, longitude, onChange }) {
  const [layer, setLayer] = useState("streets");
  const [linkText, setLinkText] = useState("");
  const [message, setMessage] = useState(null);
  const [locating, setLocating] = useState(false);

  const position = useMemo(() => {
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (latitude === "" || longitude === "") return null;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
    return [lat, lng];
  }, [latitude, longitude]);

  // نحتفظ بمركز البداية فقط؛ التنقل بعدها يتولاه FollowPosition
  const [initialCenter] = useState(() => position || [35.6971, -0.6308]);

  const pick = (lat, lng) => {
    onChange(roundCoord(lat), roundCoord(lng));
    setMessage(null);
  };

  const applyLink = () => {
    const coords = parseGoogleMapsInput(linkText);
    if (coords) {
      pick(coords.latitude, coords.longitude);
      setLinkText("");
      setMessage({ tone: "ok", text: "تم تحديد الموقع من خرائط Google" });
      return;
    }
    setMessage({
      tone: "danger",
      text: isShortGoogleLink(linkText)
        ? "الروابط المختصرة غير مدعومة: افتح الرابط ثم انسخ العنوان الكامل من شريط المتصفح، أو انقر بالزر الأيمن على الموقع في Google Maps وانسخ الإحداثيات"
        : "لم نتعرّف على إحداثيات في هذا النص",
    });
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setMessage({ tone: "danger", text: "المتصفح لا يدعم تحديد الموقع" });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        pick(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setLocating(false);
        setMessage({ tone: "danger", text: "تعذّر الحصول على موقعك الحالي" });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const tile = LAYERS[layer];

  return (
    <div className="location-picker">
      <div className="location-picker__bar">
        <div className="segmented" role="group" aria-label="نوع الخريطة">
          {Object.entries(LAYERS).map(([key, { label }]) => (
            <button
              key={key}
              type="button"
              className={`segmented__btn${layer === key ? " segmented__btn--active" : ""}`}
              onClick={() => setLayer(key)}
              aria-pressed={layer === key}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="btn btn--secondary btn--sm"
          onClick={useMyLocation}
          disabled={locating}
        >
          {locating ? <span className="spinner" /> : <CrosshairIcon size={15} />}
          موقعي الحالي
        </button>
      </div>

      <MapContainer
        center={initialCenter}
        zoom={position ? 16 : 13}
        scrollWheelZoom
        className="location-picker__map"
      >
        <TileLayer key={layer} url={tile.url} attribution={tile.attribution} />
        <ClickToPick onPick={pick} />
        <FollowPosition position={position} />
        {position && (
          <Marker
            position={position}
            icon={pinIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const { lat, lng } = e.target.getLatLng();
                pick(lat, lng);
              },
            }}
          />
        )}
      </MapContainer>

      <span className="field__hint">
        انقر على الخريطة لتحديد موقع الحاوية، ويمكنك سحب الدبوس لضبطه.
      </span>

      <div className="field">
        <label className="field__label" htmlFor="google-maps-link">
          أو الصق رابطًا من خرائط Google
        </label>
        <div className="row" style={{ gap: 8 }}>
          <input
            id="google-maps-link"
            className="input"
            type="text"
            dir="ltr"
            placeholder="https://www.google.com/maps/@35.69,-0.63,17z  أو  35.6971, -0.6308"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            onKeyDown={(e) => {
              // Enter يطبّق الرابط بدل إرسال النموذج كاملًا
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
            }}
          />
          <button
            type="button"
            className="btn btn--secondary"
            onClick={applyLink}
            disabled={!linkText.trim()}
          >
            تطبيق
          </button>
        </div>
        {position && (
          <a
            className="location-picker__link"
            href={googleMapsUrl(position[0], position[1])}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLinkIcon size={14} />
            عرض الموقع المحدد في خرائط Google
          </a>
        )}
      </div>

      {message && (
        <span className={`location-picker__msg location-picker__msg--${message.tone}`}>
          {message.text}
        </span>
      )}
    </div>
  );
}

export default LocationPicker;
