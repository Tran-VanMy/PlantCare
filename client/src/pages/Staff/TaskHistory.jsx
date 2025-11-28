import { useEffect, useState } from "react";
import api from "../../api/api";

export default function TaskHistory() {
  const [history, setHistory] = useState([]);

  const load = async () => {
    const res = await api.get("/staff/tasks/history");
    setHistory(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => {
    load().catch(console.error);

    // ✅ auto refresh để thấy ngay sau hoàn tất (req15)
    const interval = setInterval(() => load().catch(() => {}), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-6">📜 Lịch sử công việc</h1>

      {history.length === 0 ? (
        <p className="text-gray-500">Chưa có lịch sử.</p>
      ) : (
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead>
            <tr className="bg-green-100 text-left">
              <th className="p-3">Mã đơn</th>
              <th className="p-3">Khách hàng</th>
              <th className="p-3">Ngày hẹn</th>
              <th className="p-3">Địa chỉ</th>
              <th className="p-3">SĐT</th>
              <th className="p-3">Tổng</th>
              <th className="p-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {history.map((o) => (
              <tr key={o.id} className="border-b hover:bg-green-50">
                <td className="p-3">{o.id}</td>
                <td className="p-3">{o.customer_name}</td>
                <td className="p-3">{new Date(o.scheduled_date).toLocaleString()}</td>
                <td className="p-3">{o.address}</td>
                <td className="p-3">{o.phone || o.customer_phone || "—"}</td>
                <td className="p-3">${o.total_price}</td>
                <td className="p-3 text-green-700">{o.status_vn || o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
