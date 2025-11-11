// client/src/pages/Admin/Reports.jsx
import { useEffect, useState } from "react";
import api from "../../api/api";

export default function Reports() {
  const [report, setReport] = useState(null);
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/admin/stats");
        setReport(res.data);
      } catch (err) {
        console.error("Failed to load report", err);
      }
    };
    fetch();
  }, []);

  if (!report) return <p>Đang tải báo cáo...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-6">Báo cáo hệ thống</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Tổng đơn hàng</p>
          <p className="text-2xl font-bold">{report.orders}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Nhân viên</p>
          <p className="text-2xl font-bold">{report.staff}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Khách hàng</p>
          <p className="text-2xl font-bold">{report.customers}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Doanh thu</p>
          <p className="text-2xl font-bold">${report.revenue}</p>
        </div>
      </div>

      <section className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Ghi chú</h2>
        <p className="text-sm text-gray-600">Báo cáo cơ bản: tổng đơn, số nhân viên, khách hàng và tổng doanh thu (được tổng hợp từ payments có status = paid).</p>
      </section>
    </div>
  );
}
