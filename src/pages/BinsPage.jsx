import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import DashboardLayout from "../components/DashboardLayout";

function BinsPage() {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBins = async () => {
      try {
        const res = await api.get("/bins/status");
        setBins(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBins();
  }, []);

  if (loading) return <p>جارِ التحميل...</p>;

  return (
    <DashboardLayout>
      <h2>الحاويات</h2>
      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Bin ID</th>
            <th>Fill Level (%)</th>
            <th>Weight (kg)</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Last Update</th>
          </tr>
        </thead>
        <tbody>
          {bins.map((bin) => (
            <tr key={bin._id}>
              <td>{bin.binId}</td>
              <td>{bin.lastFillLevel ?? "-"}</td>
              <td>{bin.lastWeight ?? "-"}</td>
              <td>{bin.latitude?.toFixed(5)}</td>
              <td>{bin.longitude?.toFixed(5)}</td>
              <td>{bin.updatedAt ? new Date(bin.updatedAt).toLocaleString() : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DashboardLayout>
  );
}

export default BinsPage;