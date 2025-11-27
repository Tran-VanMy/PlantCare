import { useEffect, useState } from "react";
import api from "../../api/api";
import Modal from "../../components/ui/Modal";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async (uid) => {
    const res = await api.get(`/customers/${uid}/orders`);
    setOrders(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      setLoading(false);
      return;
    }

    fetchOrders(storedUser.id)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const cancelOrder = async (id) => {
    if (!confirm("Bạn chắc chắn muốn hủy đơn này?")) return;
    await api.put(`/orders/${id}/cancel`);
    const storedUser = JSON.parse(localStorage.getItem("user"));
    fetchOrders(storedUser.id);
  };

  if (loading) return <p>Đang tải đơn hàng...</p>;
  if (orders.length === 0) return <p>Bạn chưa có đơn hàng nào.</p>;

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-6">🧾 Lịch sử đơn hàng</h1>

      <table className="min-w-full bg-white rounded-lg shadow">
        <thead>
          <tr className="bg-green-100 text-left">
            <th className="p-3">Mã đơn</th>
            <th className="p-3">Dịch vụ</th>
            <th className="p-3">Cây</th>
            <th className="p-3">Ngày hẹn</th>
            <th className="p-3">Địa chỉ</th>
            <th className="p-3">SĐT</th>
            <th className="p-3">Tổng ($)</th>
            <th className="p-3">Trạng thái</th>
            <th className="p-3 text-center">Chi tiết</th>
            <th className="p-3 text-center">Hủy đơn</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b hover:bg-green-50">
              <td className="p-3">{o.id}</td>
              <td className="p-3">{o.service}</td>
              <td className="p-3">{o.plant}</td>
              <td className="p-3">{new Date(o.date).toLocaleString()}</td>
              <td className="p-3">{o.address}</td>
              <td className="p-3">{o.phone || "—"}</td>
              <td className="p-3">{Number(o.total).toFixed(2)}</td>
              <td className="p-3 text-green-700">{o.status}</td>

              <td className="p-3 text-center">
                <button
                  onClick={() => setSelectedOrder(o)}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  Chi tiết
                </button>
              </td>

              <td className="p-3 text-center">
                {o.status === "Chờ xác nhận" ? (
                  <button onClick={() => cancelOrder(o.id)} className="px-3 py-1 bg-red-600 text-white rounded">
                    Hủy
                  </button>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Chi tiết đơn #${selectedOrder?.id}`}
      >
        {selectedOrder && (
          <div className="space-y-2">
            <p><strong>Mã đơn:</strong> {selectedOrder.id}</p>
            <p><strong>Dịch vụ:</strong> {selectedOrder.service}</p>
            <p><strong>Cây:</strong> {selectedOrder.plant}</p>
            <p><strong>Ngày hẹn:</strong> {new Date(selectedOrder.date).toLocaleString()}</p>
            <p><strong>Địa chỉ:</strong> {selectedOrder.address}</p>
            <p><strong>SĐT:</strong> {selectedOrder.phone || "—"}</p>
            <p><strong>Tổng tiền:</strong> ${Number(selectedOrder.total).toFixed(2)}</p>
            <p><strong>Trạng thái:</strong> {selectedOrder.status}</p>
            <p><strong>Voucher:</strong> {selectedOrder.voucher_code || "—"}</p>
            <p><strong>Ghi chú:</strong> {selectedOrder.note || "—"}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
