import { useEffect, useState } from "react";
import api from "../../api/api";
import Modal from "../../components/ui/Modal";

const STATUS_OPTIONS = [
  { en: "pending", vn: "Chờ xác nhận" },
  { en: "confirmed", vn: "Đã nhận" },
  { en: "moving", vn: "Đang di chuyển" },
  { en: "caring", vn: "Đang chăm" },
  { en: "completed", vn: "Hoàn tất" },
  { en: "cancelled", vn: "Đã hủy" },
];

export default function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    const res = await api.get("/admin/orders");
    setOrders(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/admin/orders/${id}`, { status: newStatus });
      load();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Update status failed");
    }
  };

  const assignStaff = async (orderId) => {
    const staffId = prompt("Nhập staff_id để gán:");
    if (!staffId) return;
    try {
      await api.post("/assignments", {
        order_id: orderId,
        staff_id: Number(staffId),
      });
      alert("Gán staff thành công!");
      load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Gán staff thất bại");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-6">Quản lý đơn hàng</h1>

      <table className="min-w-full bg-white rounded-lg shadow">
        <thead>
          <tr className="bg-green-100 text-left">
            <th className="p-3">Mã đơn</th>
            <th className="p-3">Khách hàng</th>
            <th className="p-3">Dịch vụ</th>
            <th className="p-3">Ngày hẹn</th>
            <th className="p-3">Địa chỉ</th>
            <th className="p-3">SĐT</th>
            <th className="p-3">Tổng ($)</th>
            <th className="p-3">Trạng thái</th>
            <th className="p-3 text-center">Hành động</th>
            <th className="p-3 text-center">Chi tiết</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b hover:bg-green-50">
              <td className="p-3">{o.id}</td>
              <td className="p-3">{o.customer_name}</td>
              <td className="p-3">{o.service_name}</td>
              <td className="p-3">{new Date(o.date).toLocaleString()}</td>
              <td className="p-3">{o.address}</td>
              <td className="p-3">{o.phone || "—"}</td>
              <td className="p-3">${Number(o.total).toFixed(2)}</td>
              <td className="p-3 text-green-700">{o.status_vn}</td>

              <td className="p-3 text-center space-x-2">
                <button
                  onClick={() => assignStaff(o.id)}
                  className="bg-purple-600 text-white px-3 py-1 rounded"
                >
                  Gán
                </button>

                <select
                  className="border p-1 rounded"
                  value={o.status}
                  onChange={(e) => updateStatus(o.id, e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.en} value={s.en}>
                      {s.vn}
                    </option>
                  ))}
                </select>
              </td>

              <td className="p-3 text-center">
                <button
                  onClick={() => setSelected(o)}
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Xem
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal chi tiết admin */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={`Chi tiết đơn #${selected?.id}`}
      >
        {selected && (
          <div className="space-y-2">
            <p><strong>Mã đơn:</strong> {selected.id}</p>
            <p><strong>Khách hàng:</strong> {selected.customer_name}</p>
            <p><strong>Dịch vụ:</strong> {selected.service_name}</p>
            <p><strong>Cây:</strong> {selected.plant_name}</p>
            <p><strong>Ngày hẹn:</strong> {new Date(selected.date).toLocaleString()}</p>
            <p><strong>Địa chỉ:</strong> {selected.address}</p>
            <p><strong>SĐT:</strong> {selected.phone || "—"}</p>
            <p><strong>Tổng tiền:</strong> ${Number(selected.total).toFixed(2)}</p>
            <p><strong>Trạng thái:</strong> {selected.status_vn}</p>
            <p><strong>Voucher:</strong> {selected.voucher_code || "—"}</p>
            <p><strong>Ghi chú:</strong> {selected.note || "—"}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
