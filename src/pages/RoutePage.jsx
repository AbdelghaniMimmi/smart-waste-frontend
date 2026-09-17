import { useCallback, useEffect, useState } from "react";
import api from "../api/axiosClient";
import DashboardLayout from "../components/DashboardLayout";
import {
  RouteIcon,
  AlertIcon,
  CheckIcon,
  ChevronIcon,
  InboxIcon,
} from "../components/Icons";
import { routeDistance } from "../lib/format";

function RouteCard({ title, description, route, isBest }) {
  const stops = route?.order || [];
  const distance = routeDistance(route);

  return (
    <div className="card">
      <div className="card__head">
        <div>
          <div className="card__title">{title}</div>
          <div className="card__desc">{description}</div>
        </div>
        {isBest && (
          <div className="card__actions">
            <span className="badge badge--ok">
              <CheckIcon size={13} />
              الأفضل
            </span>
          </div>
        )}
      </div>

      <div className="card__body stack">
        <div className="row" style={{ gap: 26 }}>
          <div>
            <div className="stat__label">
              {distance.onRoads ? "المسافة عبر الطرق" : "المسافة الكلية"}
            </div>
            <div className="metric">
              <span className="metric__value">
                {distance.km != null ? distance.km.toFixed(2) : "—"}
              </span>
              <span className="metric__unit">كم</span>
            </div>
            {distance.onRoads && route?.totalDistanceKm != null && (
              <div className="stat__hint">
                مسافة مباشرة: {route.totalDistanceKm.toFixed(2)} كم
              </div>
            )}
          </div>
          <div>
            <div className="stat__label">عدد المحطات</div>
            <div className="metric">
              <span className="metric__value">{stops.length}</span>
              <span className="metric__unit">حاوية</span>
            </div>
          </div>
        </div>

        <div>
          <div className="stat__label" style={{ marginBottom: 9 }}>
            ترتيب الزيارة
          </div>
          {stops.length === 0 ? (
            <span className="muted">لا توجد محطات</span>
          ) : (
            <div className="route-chips">
              {stops.map((binId, index) => (
                <span key={`${binId}-${index}`} style={{ display: "contents" }}>
                  {index > 0 && (
                    <span className="route-arrow">
                      <ChevronIcon size={15} />
                    </span>
                  )}
                  <span className="route-chip">{binId}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RoutePage() {
  const [data, setData] = useState(null);
  const [threshold, setThreshold] = useState(80);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRoute = useCallback(async (value) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/bins/route?threshold=${value}`);
      setData(res.data);
    } catch (err) {
      console.error("Error loading routes", err);
      setError("تعذّر حساب مسارات الجمع");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoute(80);
  }, [fetchRoute]);

  const nn = data?.nearestNeighbor;
  const ci = data?.cheapestInsertion;
  // نقارن بالمسافة الحقيقية عبر الطرق لأنها ما يقطعه السائق فعليًا
  const nnDistance = routeDistance(nn).km;
  const ciDistance = routeDistance(ci).km;

  const savings =
    nnDistance != null && ciDistance != null
      ? Math.abs(nnDistance - ciDistance)
      : null;

  // Below this margin the two routes are effectively equivalent, so crowning a
  // "best" would be noise rather than signal.
  const isTie = savings != null && savings <= 0.01;
  const bestKey =
    savings == null || isTie ? null : ciDistance < nnDistance ? "ci" : "nn";

  const hasStops = (nn?.order?.length || 0) > 0 || (ci?.order?.length || 0) > 0;

  return (
    <DashboardLayout
      title="تحسين مسار الجمع"
      subtitle="مقارنة بين خوارزميتين لترتيب زيارة الحاويات"
    >
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card__body">
          <div className="toolbar">
            <div className="field" style={{ flex: 1, minWidth: 220 }}>
              <label className="field__label" htmlFor="route-threshold">
                حد الامتلاء: {threshold}%
              </label>
              <input
                id="route-threshold"
                className="range"
                type="range"
                min={0}
                max={100}
                step={5}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
              />
              <span className="field__hint">
                تُدرج في المسار الحاويات التي تجاوزت هذا الحد فقط
              </span>
            </div>
            <button
              className="btn btn--primary"
              onClick={() => fetchRoute(threshold)}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : <RouteIcon size={17} />}
              إعادة حساب المسار
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <span className="spinner spinner--lg" />
          <span className="loading-state__text">جارٍ حساب المسارات...</span>
        </div>
      ) : error ? (
        <div className="alert alert--danger" role="alert">
          <AlertIcon size={17} className="alert__icon" />
          <span>{error}</span>
        </div>
      ) : !hasStops ? (
        <div className="card">
          <div className="empty">
            <div className="empty__icon">
              <InboxIcon size={26} />
            </div>
            <div className="empty__title">لا توجد حاويات ضمن هذا الحد</div>
            <div className="empty__desc">
              خفّض حد الامتلاء لإدراج حاويات أقل امتلاءً في المسار.
            </div>
          </div>
        </div>
      ) : (
        <div className="stack">
          {isTie ? (
            <div className="alert alert--info">
              <CheckIcon size={17} className="alert__icon" />
              <span>الخوارزميتان تعطيان المسافة نفسها لهذه المجموعة.</span>
            </div>
          ) : (
            savings != null && (
              <div className="alert alert--info">
                <CheckIcon size={17} className="alert__icon" />
                <span>
                  الخوارزمية الأفضل توفّر{" "}
                  <strong>{savings.toFixed(2)} كم</strong> مقارنة بالأخرى.
                </span>
              </div>
            )
          )}

          <div className="grid-2">
            <RouteCard
              title="Cheapest Insertion"
              description="إدراج الحاوية الأقل تكلفة في كل خطوة"
              route={ci}
              isBest={bestKey === "ci"}
            />
            <RouteCard
              title="Nearest Neighbor"
              description="الانتقال دائمًا إلى أقرب حاوية تالية"
              route={nn}
              isBest={bestKey === "nn"}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default RoutePage;
