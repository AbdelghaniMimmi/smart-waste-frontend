import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import DashboardLayout from "../components/DashboardLayout";
import { AlertIcon, CheckIcon, GaugeIcon } from "../components/Icons";
import { fillTone } from "../lib/format";

function SettingsPage() {
  const [threshold, setThreshold] = useState(80);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await api.get("/settings");
        const settings = res.data;
        if (settings && typeof settings.defaultThreshold === "number") {
          setThreshold(settings.defaultThreshold);
        }
      } catch (err) {
        console.error("Error loading settings", err);
        setFeedback({ type: "danger", text: "تعذّر تحميل الإعدادات" });
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setSaving(true);

    try {
      const res = await api.put("/settings/threshold", {
        defaultThreshold: Number(threshold),
      });
      const newSettings = res.data.settings;
      if (newSettings && typeof newSettings.defaultThreshold === "number") {
        setThreshold(newSettings.defaultThreshold);
      }
      setFeedback({ type: "ok", text: "تم حفظ الإعدادات بنجاح" });
    } catch (err) {
      console.error("Error updating threshold", err);
      setFeedback({ type: "danger", text: "حدث خطأ أثناء حفظ الإعدادات" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="إعدادات النظام" subtitle="ضبط سلوك المنظومة">
        <div className="loading-state">
          <span className="spinner spinner--lg" />
          <span className="loading-state__text">جارٍ تحميل الإعدادات...</span>
        </div>
      </DashboardLayout>
    );
  }

  const tone = fillTone(Number(threshold));

  return (
    <DashboardLayout
      title="إعدادات النظام"
      subtitle="ضبط الحد الافتراضي لاعتبار الحاوية حرجة"
    >
      <div className="split">
        <div className="card">
          <div className="card__head">
            <div className="stat__icon stat__icon--brand">
              <GaugeIcon size={20} />
            </div>
            <div>
              <div className="card__title">الحد الافتراضي</div>
              <div className="card__desc">المعاينة الحالية</div>
            </div>
          </div>
          <div className="card__body stack">
            <div>
              <div className="stat__value" style={{ fontSize: "2.6rem" }}>
                {threshold}%
              </div>
              <div className="stat__hint">
                أي حاوية تتجاوز هذا المستوى تُعتبر حرجة وتُدرج في مسار الجمع.
              </div>
            </div>
            <div className="fill">
              <div className="fill__track">
                <div
                  className={`fill__bar fill__bar--${tone}`}
                  style={{ width: `${Math.min(100, Math.max(0, threshold))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card__head">
            <div>
              <div className="card__title">تعديل الإعدادات</div>
              <div className="card__desc">
                يؤثر هذا الحد على لوحات التحكم والتقارير
              </div>
            </div>
          </div>

          <form className="card__body stack" onSubmit={handleSave}>
            <div className="field">
              <label className="field__label" htmlFor="settings-threshold">
                حد الامتلاء الحرج
              </label>
              <input
                id="settings-threshold"
                className="range"
                type="range"
                min={0}
                max={100}
                step={1}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
              />
              <span className="field__hint">
                اسحب المؤشر أو أدخل القيمة يدويًا (0 - 100)
              </span>
            </div>

            <div className="field" style={{ maxWidth: 180 }}>
              <label className="field__label" htmlFor="threshold-number">
                القيمة (%)
              </label>
              <input
                id="threshold-number"
                className="input"
                type="number"
                min={0}
                max={100}
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              />
            </div>

            {feedback && (
              <div className={`alert alert--${feedback.type}`} role="status">
                {feedback.type === "ok" ? (
                  <CheckIcon size={17} className="alert__icon" />
                ) : (
                  <AlertIcon size={17} className="alert__icon" />
                )}
                <span>{feedback.text}</span>
              </div>
            )}

            <div className="row">
              <button
                type="submit"
                className="btn btn--primary"
                disabled={saving}
              >
                {saving && <span className="spinner" />}
                {saving ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default SettingsPage;
