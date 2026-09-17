import { useCallback, useEffect, useState } from "react";
import api from "../api/axiosClient";
import DashboardLayout from "../components/DashboardLayout";
import {
  TruckIcon,
  RouteIcon,
  GaugeIcon,
  AlertIcon,
  CheckIcon,
  RefreshIcon,
  MapIcon,
} from "../components/Icons";
import { useNavigate } from "react-router-dom";
import { routeDistance } from "../lib/format";

function DriverDashboard() {
  const [routeData, setRouteData] = useState(null);
  const [threshold, setThreshold] = useState(80);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchRoute = useCallback(async (value) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/bins/route?threshold=${value}`);
      setRouteData(res.data);
    } catch (err) {
      console.error("Error loading driver route", err);
      setError("تعذّر تحميل مسار الجمع");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoute(80);
  }, [fetchRoute]);

  const route = routeData?.cheapestInsertion || routeData?.nearestNeighbor;
  const stops = route?.order || [];
  const distance = routeDistance(route);

  return (
    <DashboardLayout
      title="مسار الجمع اليومي"
      subtitle="الترتيب الموصى به لزيارة الحاويات"
      actions={
        <button
          className="btn btn--secondary btn--sm"
          onClick={() => fetchRoute(threshold)}
          disabled={loading}
        >
          <RefreshIcon size={15} />
          تحديث
        </button>
      }
    >
      <div className="stat-grid">
        <div className="stat">
          <div className="stat__top">
            <div className="stat__icon stat__icon--brand">
              <TruckIcon size={20} />
            </div>
            <div className="stat__label">عدد المحطات</div>
          </div>
          <div className="stat__value">{stops.length}</div>
          <div className="stat__hint">حاوية في المسار الحالي</div>
        </div>

        <div className="stat">
          <div className="stat__top">
            <div className="stat__icon stat__icon--info">
              <RouteIcon size={20} />
            </div>
            <div className="stat__label">المسافة الكلية</div>
          </div>
          <div className="stat__value">
            {distance.km != null ? `${distance.km.toFixed(1)} كم` : "—"}
          </div>
          <div className="stat__hint">
            {distance.onRoads
              ? "مسافة القيادة عبر الطرق"
              : "مسافة مباشرة (خدمة الطرق غير متاحة)"}
          </div>
        </div>

        <div className="stat">
          <div className="stat__top">
            <div className="stat__icon stat__icon--warn">
              <GaugeIcon size={20} />
            </div>
            <div className="stat__label">حد الامتلاء</div>
          </div>
          <div className="stat__value">{threshold}%</div>
          <div className="stat__hint">تُدرج الحاويات الأعلى من هذا الحد</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card__body">
          <div className="toolbar">
            <div className="field toolbar__field" style={{ flex: 1, minWidth: 220 }}>
              <label className="field__label" htmlFor="threshold">
                حد الامتلاء المطلوب: {threshold}%
              </label>
              <input
                id="threshold"
                className="range"
                type="range"
                min={0}
                max={100}
                step={5}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
              />
            </div>
            <button
              className="btn btn--primary"
              onClick={() => fetchRoute(threshold)}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : <RouteIcon size={17} />}
              إعادة حساب المسار
            </button>
            <button
              className="btn btn--secondary"
              onClick={() => navigate("/map")}
            >
              <MapIcon size={17} />
              عرض على الخريطة
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card__head">
          <div>
            <div className="card__title">ترتيب المحطات</div>
            <div className="card__desc">اتبع الترتيب من الأعلى إلى الأسفل</div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <span className="spinner spinner--lg" />
            <span className="loading-state__text">جارٍ تحميل المسار...</span>
          </div>
        ) : error ? (
          <div className="card__body">
            <div className="alert alert--danger" role="alert">
              <AlertIcon size={17} className="alert__icon" />
              <span>{error}</span>
            </div>
          </div>
        ) : stops.length === 0 ? (
          <div className="empty">
            <div className="empty__icon">
              <CheckIcon size={26} />
            </div>
            <div className="empty__title">لا توجد محطات في المسار</div>
            <div className="empty__desc">
              لا توجد حاويات تتجاوز حد الامتلاء المحدد. جرّب خفض الحد لعرض
              حاويات أقل امتلاءً.
            </div>
          </div>
        ) : (
          <div className="card__body">
            <div className="stops">
              {stops.map((binId, index) => (
                <div
                  className={`stop${index === 0 ? " stop--first" : ""}`}
                  key={`${binId}-${index}`}
                >
                  <div className="stop__marker">{index + 1}</div>
                  <div className="stop__id">{binId}</div>
                  {index === 0 && (
                    <span className="badge badge--ok">نقطة البداية</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default DriverDashboard;
