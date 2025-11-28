// client/src/pages/Staff/VisitDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/api";

export default function VisitDetail() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/staff/tasks/${id}`);
      setTask(res.data);
    } catch (err) {
      console.error("load visit detail error", err);
      setTask(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(() => load().catch(() => {}), 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <p>Đang tải...</p>;
  if (!task) return <p>Không tìm thấy công việc.</p>;

  const move = async () => {
    await api.put(`/staff/orders/${id}/move`);
    load();
  };

  const startCare = async () => {
    await api.put(`/staff/orders/${id}/care`);
    load();
  };

  const complete = async () => {
    await api.put(`/staff/orders/${id}/complete`);
    load();
  };

  const statusVN = task.status_vn || task.status;
  const canMove = statusVN === "Đã nhận";
  const canCare = statusVN === "Đang di chuyển";
  const canComplete = statusVN === "Đang chăm";

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-6">
        Chi tiết công việc #{id}
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-lg space-y-2">
        <p><strong>Khách hàng:</strong> {task.customer_name}</p>
        <p><strong>Địa chỉ:</strong> {task.address}</p>
        <p><strong>Số điện thoại:</strong> {task.phone || task.customer_phone || "—"}</p>
        <p><strong>Ngày thực hiện:</strong> {new Date(task.scheduled_date).toLocaleString()}</p>
        <p><strong>Dịch vụ:</strong> {task.services}</p>
        <p><strong>Cây:</strong> {task.plant_name || task.plant || "—"}</p>
        <p><strong>Voucher:</strong> {task.voucher_code || task.voucher || "—"}</p>
        <p><strong>Ghi chú:</strong> {task.note || "—"}</p>
        <p>
          <strong>Trạng thái:</strong>{" "}
          <span className="text-green-700 font-semibold">{statusVN}</span>
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {canMove && (
            <button
              onClick={move}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Di chuyển
            </button>
          )}

          {canCare && (
            <button
              onClick={startCare}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Bắt đầu chăm
            </button>
          )}

          {canComplete && (
            <button
              onClick={complete}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
            >
              Hoàn thành đơn
            </button>
          )}

          {!canMove && !canCare && !canComplete && statusVN !== "Hoàn tất" && (
            <p className="text-sm text-gray-500">
              Hiện chưa có hành động phù hợp cho trạng thái này.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
