import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import DashboardLayout from "../components/DashboardLayout";

function SettingsPage() {
  const [threshold, setThreshold] = useState(80);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/settings");
      const settings = res.data;
      if (settings && typeof settings.defaultThreshold === "number") {
        setThreshold(settings.defaultThreshold);
      }
    } catch (err) {
      console.error("Error loading settings", err);
      setMessage("تعذّر تحميل الإعدادات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await api.put("/settings/threshold", {
        defaultThreshold: Number(threshold),
      });
      setMessage("تم تحديث threshold بنجاح");
      // تحديث القيمة من الرد
      const newSettings = res.data.settings;
      if (newSettings && typeof newSettings.defaultThreshold === "number") {
        setThreshold(newSettings.defaultThreshold);
      }
    } catch (err) {
      console.error("Error updating threshold", err);
      setMessage("حدث خطأ أثناء حفظ الإعدادات");
    }
  };

  if (loading) {
    return <p style={{ padding: 20 }}>جارٍ تحميل الإعدادات...</p>;
  }

  return (
    <DashboardLayout>
      <h1>إعدادات النظام</h1>

      <form onSubmit={handleSave}>
        <div style={{ marginBottom: 10 }}>
          <label>Threshold الافتراضي (%): </label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            min={0}
            max={100}
          />
        </div>

        <button type="submit">حفظ</button>
      </form>

      {message && <p style={{ marginTop: 10 }}>{message}</p>}
    </DashboardLayout>
  );
}

export default SettingsPage;