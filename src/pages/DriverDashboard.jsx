import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import DashboardLayout from "../components/DashboardLayout";

function DriverDashboard() {
  const [routeData, setRouteData] = useState(null);
  const [threshold, setThreshold] = useState(80);
  const [loading, setLoading] = useState(true);

  const fetchRoute = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/bins/route?threshold=${threshold}`);
      setRouteData(res.data);
    } catch (err) {
      console.error("Error loading driver route", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const route = routeData?.cheapestInsertion || routeData?.nearestNeighbor;

  return (
    <DashboardLayout>
      <h1>لوحة السائق</h1>

      <div style={{ marginBottom: 10 }}>
        <label>Threshold (%): </label>
        <input
          type="number"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          style={{ width: 80, marginRight: 10 }}
        />
        <button onClick={fetchRoute}>تحديث المسار</button>
      </div>

      {loading && <p>جارٍ تحميل المسار...</p>}

      {!loading && !route && <p>لا يوجد مسار متاح حاليًا.</p>}

      {!loading && route && (
        <div>
          <p>
            المسافة الكلية: {route.totalDistanceKm?.toFixed(2)} km
          </p>
          <h3>ترتيب الحاويات:</h3>
          <ol>
            {route.order.map((binId) => (
              <li key={binId}>{binId}</li>
            ))}
          </ol>
        </div>
      )}
    </DashboardLayout>
  );
}

export default DriverDashboard;