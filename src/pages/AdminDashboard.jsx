import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosClient";

function AdminDashboard() {
  const [bins, setBins] = useState([]);
  const [criticalCount, setCriticalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const threshold = 80;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statusRes = await api.get("/bins/status");
        const allBins = statusRes.data || [];
        setBins(allBins);

        const criticalRes = await api.get(`/bins/critical?threshold=${threshold}`);
        const critBins = criticalRes.data.bins || [];
        setCriticalCount(critBins.length);
      } catch (err) {
        console.error("Error loading admin dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p style={{ padding: 20 }}>جارٍ تحميل البيانات...</p>;

  const totalBins = bins.length;
  const lowBins = bins.filter(
    (b) => b.lastFillLevel !== null && b.lastFillLevel < 20
  ).length;

  return (
    <div style={{ padding: 20 }}>
      <h1>لوحة التحكم (Admin)</h1>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "20px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ padding: 16, borderRadius: 8, backgroundColor: "#f5f5f5" }}>
          <h3>عدد الحاويات</h3>
          <p style={{ fontSize: 24, margin: 0 }}>{totalBins}</p>
        </div>

        <div style={{ padding: 16, borderRadius: 8, backgroundColor: "#ffe5e5" }}>
          <h3>الحاويات الحرجة (≥ {threshold}%)</h3>
          <p style={{ fontSize: 24, margin: 0 }}>{criticalCount}</p>
        </div>

        <div style={{ padding: 16, borderRadius: 8, backgroundColor: "#e5f5ff" }}>
          <h3>حاويات شبه فارغة (&lt; 20%)</h3>
          <p style={{ fontSize: 24, margin: 0 }}>{lowBins}</p>
        </div>
      </div>

      <div style={{ marginTop: 30 }}>
        <h2>تنقل سريع</h2>
        <button onClick={() => navigate("/bins")} style={{ marginRight: 10 }}>
          عرض الحاويات
        </button>
        <button onClick={() => navigate("/route")} style={{ marginRight: 10 }}>
          مسار الجمع
        </button>
        <button onClick={() => navigate("/map")} style={{ marginRight: 10 }}>
          خريطة الحاويات
        </button>
        <button onClick={() => navigate("/settings")} style={{ marginRight: 10 }}>
          إعدادات النظام
        </button>
        {/* لاحقًا: إدارة المستخدمين مثلاً */}
      </div>
    </div>
  );
}

export default AdminDashboard;