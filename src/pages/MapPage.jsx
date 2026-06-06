import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import BinsMap from "../components/BinsMap";

function MapPage() {
  const [bins, setBins] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [threshold, setThreshold] = useState(80);
  const [algo, setAlgo] = useState("nearest"); // "nearest" أو "cheapest"
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      // الحاويات الحرجة حسب threshold
      const binsRes = await api.get(`/bins/critical?threshold=${threshold}`);
      setBins(binsRes.data.bins || []);

      // المسارات (NN و CI)
      const routeRes = await api.get(`/bins/route?threshold=${threshold}`);
      setRouteData(routeRes.data);
    } catch (err) {
      console.error("Error loading map data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // إذا أردت منع تحذير ESLint:
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentRoute =
    algo === "nearest"
      ? routeData?.nearestNeighbor
      : routeData?.cheapestInsertion;

  return (
    <div style={{ padding: 20 }}>
      <h2>خريطة الحاويات والمسار</h2>

      <div style={{ marginBottom: 10 }}>
        <label>Threshold (%): </label>
        <input
          type="number"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          style={{ width: 80, marginRight: 10 }}
        />
        <button onClick={fetchData} style={{ marginRight: 20 }}>
          تحديث
        </button>

        <label>الخوارزمية:</label>
        <select
          value={algo}
          onChange={(e) => setAlgo(e.target.value)}
          style={{ marginLeft: 5 }}
        >
          <option value="nearest">Nearest Neighbor</option>
          <option value="cheapest">Cheapest Insertion</option>
        </select>
      </div>

      {loading && <p>جارٍ تحميل البيانات...</p>}

      {!loading && bins.length === 0 && (
        <p>لا توجد حاويات حرجة عند هذا threshold.</p>
      )}

      {!loading && bins.length > 0 && (
        <>
          <BinsMap bins={bins} route={currentRoute} />

          {currentRoute && (
            <div style={{ marginTop: 10 }}>
              <p>
                المسافة الكلية:{" "}
                {currentRoute.totalDistanceKm?.toFixed(2)} km
              </p>
              <p>ترتيب الحاويات: {currentRoute.order.join(" → ")}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MapPage;