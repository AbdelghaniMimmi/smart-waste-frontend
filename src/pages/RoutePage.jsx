import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import DashboardLayout from "../components/DashboardLayout";

function RoutePage() {
  const [data, setData] = useState(null);
  const [threshold, setThreshold] = useState(80);

  const fetchRoute = async () => {
    try {
      const res = await api.get(`/bins/route?threshold=${threshold}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRoute();
  }, []); // أول مرة

  return (
    <DashboardLayout>
      <h2>تحسين مسار الجمع</h2>

      <div>
        <label>Threshold (%): </label>
        <input
          type="number"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
        />
        <button onClick={fetchRoute}>تحديث المسار</button>
      </div>

      {data && (
        <>
          <h3>Nearest Neighbor</h3>
          <p>المسافة الكلية: {data.nearestNeighbor?.totalDistanceKm?.toFixed(2)} km</p>
          <p>ترتيب الحاويات: {data.nearestNeighbor?.order.join(" → ")}</p>

          <h3>Cheapest Insertion</h3>
          <p>المسافة الكلية: {data.cheapestInsertion?.totalDistanceKm?.toFixed(2)} km</p>
          <p>ترتيب الحاويات: {data.cheapestInsertion?.order.join(" → ")}</p>
        </>
      )}
    </DashboardLayout>
  );
}

export default RoutePage;