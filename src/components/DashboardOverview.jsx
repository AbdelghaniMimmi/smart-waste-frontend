import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosClient";
import FillLevel from "./FillLevel";
import {
  TrashBinIcon,
  AlertIcon,
  InboxIcon,
  GaugeIcon,
  RouteIcon,
  MapIcon,
  SettingsIcon,
  CheckIcon,
  RefreshIcon,
} from "./Icons";

const THRESHOLD = 80;

function StatCard({ icon: CardIcon, tone, label, value, hint }) {
  return (
    <div className="stat">
      <div className="stat__top">
        <div className={`stat__icon stat__icon--${tone}`}>
          <CardIcon size={20} />
        </div>
        <div className="stat__label">{label}</div>
      </div>
      <div className="stat__value">{value}</div>
      {hint && <div className="stat__hint">{hint}</div>}
    </div>
  );
}

function DashboardOverview({ showSettings }) {
  const [bins, setBins] = useState([]);
  const [criticalBins, setCriticalBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statusRes, criticalRes] = await Promise.all([
        api.get("/bins/status"),
        api.get(`/bins/critical?threshold=${THRESHOLD}`),
      ]);
      setBins(statusRes.data || []);
      setCriticalBins(criticalRes.data.bins || []);
    } catch (err) {
      console.error("Error loading dashboard data", err);
      setError("تعذّر تحميل بيانات الحاويات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="loading-state">
        <span className="spinner spinner--lg" />
        <span className="loading-state__text">جارٍ تحميل البيانات...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert--danger" role="alert">
        <AlertIcon size={17} className="alert__icon" />
        <span>{error}</span>
      </div>
    );
  }

  const measured = bins.filter((b) => b.lastFillLevel !== null && b.lastFillLevel !== undefined);
  const lowBins = measured.filter((b) => b.lastFillLevel < 20).length;
  const avgFill = measured.length
    ? Math.round(measured.reduce((sum, b) => sum + b.lastFillLevel, 0) / measured.length)
    : 0;

  const topCritical = [...criticalBins]
    .sort((a, b) => (b.lastFillLevel ?? 0) - (a.lastFillLevel ?? 0))
    .slice(0, 6);

  const quickActions = [
    { label: "عرض الحاويات", icon: TrashBinIcon, path: "/bins" },
    { label: "مسار الجمع", icon: RouteIcon, path: "/route" },
    { label: "خريطة الحاويات", icon: MapIcon, path: "/map" },
    ...(showSettings
      ? [{ label: "إعدادات النظام", icon: SettingsIcon, path: "/settings" }]
      : []),
  ];

  return (
    <>
      <div className="stat-grid">
        <StatCard
          icon={TrashBinIcon}
          tone="brand"
          label="إجمالي الحاويات"
          value={bins.length}
          hint={`${measured.length} حاوية مزوّدة بقراءات`}
        />
        <StatCard
          icon={AlertIcon}
          tone="danger"
          label={`حاويات حرجة (≥ ${THRESHOLD}%)`}
          value={criticalBins.length}
          hint="تحتاج إلى جمع عاجل"
        />
        <StatCard
          icon={InboxIcon}
          tone="info"
          label="حاويات شبه فارغة (< 20%)"
          value={lowBins}
          hint="لا تحتاج تدخّلًا حاليًا"
        />
        <StatCard
          icon={GaugeIcon}
          tone="warn"
          label="متوسط الامتلاء"
          value={`${avgFill}%`}
          hint="عبر كل الحاويات المقيسة"
        />
      </div>

      <div className="split">
        <div className="card">
          <div className="card__head">
            <div>
              <div className="card__title">إجراءات سريعة</div>
              <div className="card__desc">انتقل إلى المهام الشائعة</div>
            </div>
          </div>
          <div className="card__body stack" style={{ gap: 9 }}>
            {quickActions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <button
                  key={action.path}
                  className="btn btn--secondary btn--block"
                  style={{ justifyContent: "flex-start" }}
                  onClick={() => navigate(action.path)}
                >
                  <ActionIcon size={18} />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card__head">
            <div>
              <div className="card__title">حاويات تحتاج إلى تدخّل</div>
              <div className="card__desc">
                الأعلى امتلاءً من بين الحاويات الحرجة
              </div>
            </div>
            <div className="card__actions">
              <button className="btn btn--ghost btn--sm" onClick={load}>
                <RefreshIcon size={15} />
                تحديث
              </button>
            </div>
          </div>

          {topCritical.length === 0 ? (
            <div className="empty">
              <div className="empty__icon">
                <CheckIcon size={26} />
              </div>
              <div className="empty__title">لا توجد حاويات حرجة</div>
              <div className="empty__desc">
                جميع الحاويات ضمن المستوى الآمن، لا حاجة إلى جمع عاجل الآن.
              </div>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>الحاوية</th>
                    <th>مستوى الامتلاء</th>
                    <th>الوزن</th>
                  </tr>
                </thead>
                <tbody>
                  {topCritical.map((bin) => (
                    <tr key={bin._id}>
                      <td className="table__id">{bin.binId}</td>
                      <td>
                        <FillLevel level={bin.lastFillLevel} />
                      </td>
                      <td className="table__mono">
                        {bin.lastWeight ?? "—"}
                        {bin.lastWeight != null && " كغ"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default DashboardOverview;
