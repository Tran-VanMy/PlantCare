import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";
import AddPlantModal from "../../components/common/AddPlantModal";
import Modal from "../../components/ui/Modal";

export default function CustomerDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ plants: 0, orders: 0, totalSpent: 0 });
  const [orders, setOrders] = useState([]);
  const [showAddPlant, setShowAddPlant] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchData = async (customerId) => {
    const plantsRes = await api.get(`/customers/${customerId}/plants`);
    const plantsCount = Array.isArray(plantsRes.data) ? plantsRes.data.length : 0;

    const ordersRes = await api.get(`/customers/${customerId}/orders`);
    const list = Array.isArray(ordersRes.data) ? ordersRes.data : [];

    const ordersCount = list.length;
    const totalSpent = list.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    setStats({ plants: plantsCount, orders: ordersCount, totalSpent });
    setOrders(list);
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) return;
    setUser(storedUser);
    fetchData(storedUser.id).catch(console.error);
  }, []);

  const cancelOrder = async (id) => {
    if (!confirm("Bạn chắc chắn muốn hủy đơn này?")) return;
    await api.put(`/orders/${id}/cancel`);
    fetchData(user.id);
  };

  const refreshPlants = async () => {
    if (!user) return;
    const res = await api.get(`/customers/${user.id}/plants`);
    const cnt = Array.isArray(res.data) ? res.data.length : 0;
    setStats((s) => ({ ...s, plants: cnt }));
  };

  if (!user) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-700 mb-2">
          Xin chào, {user.full_name || user.name} 🌿
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Stat label="Cây của bạn" value={stats.plants} />
        <Stat label="Tổng đơn hàng" value={stats.orders} />
        <Stat label="Tổng chi tiêu ($)" value={Number(stats.totalSpent).toFixed(2)} />
      </div>

      {/* ✅ bảng full info */}
      <section className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-green-700 mb-4">Đơn hàng của bạn</h2>

        {orders.length === 0 ? (
          <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
        ) : (
          <table className="min-w-full">
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
                      <button
                        onClick={() => cancelOrder(o.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded"
                      >
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
        )}
      </section>

      <div className="mt-8 flex gap-4">
        <Link to="/customer/my-plants" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
          🌱 Quản lý cây
        </Link>

        <button onClick={() => setShowAddPlant(true)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          ➕ Thêm cây
        </button>

        <Link to="/customer/orders" className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300">
          🧾 Lịch sử đơn hàng
        </Link>
      </div>

      {/* modal chi tiết */}
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

      <AddPlantModal
        isOpen={showAddPlant}
        onClose={() => setShowAddPlant(false)}
        onAdded={() => refreshPlants()}
      />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow text-center">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-green-700">{value}</p>
    </div>
  );
}
