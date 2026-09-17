import { useCallback, useEffect, useState } from "react";
import api from "../api/axiosClient";
import BinsMap from "../components/BinsMap";
import DashboardLayout from "../components/DashboardLayout";
import { AlertIcon, InboxIcon, RefreshIcon } from "../components/Icons";
import { routeDistance } from "../lib/format";

const LEGEND = [
  { color: "#059669", label: "أقل من 50%" },
  { color: "#d97706", label: "50% - 79%" },
  { color: "#e11d48", label: "80% فأكثر" },
];

function MapPage() {
  const [bins, setBins] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [threshold, setThreshold] = useState(80);
  const [algo, setAlgo] = useState("cheapest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async (value) => {
    setLoading(true);
    setError("");
    try {
      const [binsRes, routeRes] = await Promise.all([
        api.get(`/bins/critical?threshold=${value}`),
        api.get(`/bins/route?threshold=${value}`),
      ]);
      setBins(binsRes.data.bins || []);
      setRouteData(routeRes.data);
    } catch (err) {
      console.error("Error loading map data", err);
      setError("تعذّر تحميل بيانات الخريطة");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(80);
  }, [fetchData]);

  const currentRoute =
    algo === "nearest" ? routeData?.nearestNeighbor : routeData?.cheapestInsertion;
  const distance = routeDistance(currentRoute);

  return (
    <DashboardLayout
      title="خريطة الحاويات"
      subtitle="مواقع الحاويات الحرجة ومسار الجمع المقترح"
      actions={
        <button
          className="btn btn--secondary btn--sm"
          onClick={() => fetchData(threshold)}
          disabled={loading}
        >
          <RefreshIcon size={15} />
          تحديث
        </button>
      }
    >
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card__body">
          <div className="toolbar">
            <div className="field" style={{ flex: 1, minWidth: 220 }}>
              <label className="field__label" htmlFor="map-threshold">
                حد الامتلاء: {threshold}%
              </label>
              <input
                id="map-threshold"
                className="range"
                type="range"
                min={0}
                max={100}
                step={5}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
              />
            </div>

            <div className="field">
              <span className="field__label">الخوارزمية</span>
              <div className="segmented" role="group" aria-label="اختيار الخوارزمية">
                <button
                  className={`segmented__btn${
                    algo === "cheapest" ? " segmented__btn--active" : ""
                  }`}
                  onClick={() => setAlgo("cheapest")}
                  aria-pressed={algo === "cheapest"}
                >
                  Cheapest Insertion
                </button>
                <button
                  className={`segmented__btn${
                    algo === "nearest" ? " segmented__btn--active" : ""
                  }`}
                  onClick={() => setAlgo("nearest")}
                  aria-pressed={algo === "nearest"}
                >
                  Nearest Neighbor
                </button>
              </div>
            </div>

            <button
              className="btn btn--primary"
              onClick={() => fetchData(threshold)}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : <RefreshIcon size={17} />}
              تطبيق
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <span className="spinner spinner--lg" />
          <span className="loading-state__text">جارٍ تحميل الخريطة...</span>
        </div>
      ) : error ? (
        <div className="alert alert--danger" role="alert">
          <AlertIcon size={17} className="alert__icon" />
          <span>{error}</span>
        </div>
      ) : bins.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="empty__icon">
              <InboxIcon size={26} />
            </div>
            <div className="empty__title">لا توجد حاويات حرجة</div>
            <div className="empty__desc">
              لا توجد حاويات تتجاوز حد {threshold}% حاليًا. خفّض الحد لعرض
              حاويات أخرى على الخريطة.
            </div>
          </div>
        </div>
      ) : (
        <div className="stack">
          <div className="stat-grid" style={{ marginBottom: 0 }}>
            <div className="stat">
              <div className="stat__label">حاويات معروضة</div>
              <div className="stat__value">{bins.length}</div>
            </div>
            <div className="stat">
              <div className="stat__label">المسافة الكلية</div>
              <div className="stat__value">
                {distance.km != null ? `${distance.km.toFixed(2)} كم` : "—"}
              </div>
              <div className="stat__hint">
                {distance.onRoads
                  ? "محسوبة عبر شبكة الطرق"
                  : "مسافة مباشرة (خدمة الطرق غير متاحة)"}
              </div>
            </div>
            <div className="stat">
              <div className="stat__label">عدد المحطات</div>
              <div className="stat__value">{currentRoute?.order?.length ?? 0}</div>
            </div>
          </div>

          <div className="map-card">
            <BinsMap bins={bins} route={currentRoute} />
          </div>

          <div className="card">
            <div className="card__body map-legend">
              <span className="field__label">دليل الألوان:</span>
              {LEGEND.map((item) => (
                <span className="map-legend__item" key={item.label}>
                  <span
                    className="map-legend__swatch"
                    style={{ background: item.color }}
                  />
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default MapPage;
