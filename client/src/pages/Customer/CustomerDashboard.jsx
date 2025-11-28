// client/src/pages/Customer/CustomerDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";
import AddPlantModal from "../../components/common/AddPlantModal";
import Modal from "../../components/ui/Modal";
import SortSearchFilterBar from "../../components/common/SortSearchFilterBar";

export default function CustomerDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ plants: 0, orders: 0, totalSpent: 0 });
  const [orders, setOrders] = useState([]);
  const [showAddPlant, setShowAddPlant] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // sort/search/filter states
  const [sortBy, setSortBy] = useState("newest");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

    // ✅ auto refresh để sync realtime (req9,11,13,14,19)
    const interval = setInterval(() => {
      fetchData(storedUser.id).catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
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

  const statusOptions = useMemo(() => {
    const set = new Set(orders.map(o => o.status));
    return Array.from(set);
  }, [orders]);

  const filteredSortedOrders = useMemo(() => {
    let list = [...orders];

    // filter status
    if (statusFilter !== "all") {
      list = list.filter(o => (o.status || "").toLowerCase() === statusFilter.toLowerCase());
    }

    // search by (mã đơn/tên dịch vụ/cây/địa chỉ/sdt)
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o => {
        return (
          String(o.id).includes(q) ||
          (o.service || "").toLowerCase().includes(q) ||
          (o.plant || "").toLowerCase().includes(q) ||
          (o.address || "").toLowerCase().includes(q) ||
          (o.phone || "").toLowerCase().includes(q)
        );
      });
    }

    // sort
    const getDate = (o) => new Date(o.date || o.scheduled_date || o.created_at || 0).getTime();
    const getTotal = (o) => Number(o.total || o.total_price || 0);
    const getService = (o) => (o.service || "").toLowerCase();

    switch (sortBy) {
      case "date_asc": list.sort((a,b)=>getDate(a)-getDate(b)); break;
      case "date_desc": list.sort((a,b)=>getDate(b)-getDate(a)); break;
      case "id_asc": list.sort((a,b)=>a.id-b.id); break;
      case "id_desc": list.sort((a,b)=>b.id-a.id); break;
      case "service_asc": list.sort((a,b)=>getService(a).localeCompare(getService(b))); break;
      case "service_desc": list.sort((a,b)=>getService(b).localeCompare(getService(a))); break;
      case "total_asc": list.sort((a,b)=>getTotal(a)-getTotal(b)); break;
      case "total_desc": list.sort((a,b)=>getTotal(b)-getTotal(a)); break;
      case "oldest": list.sort((a,b)=>getDate(a)-getDate(b)); break;
      case "newest":
      default: list.sort((a,b)=>getDate(b)-getDate(a)); break;
    }

    return list;
  }, [orders, sortBy, search, statusFilter]);

  if (!user) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-700 mb-2">
          Xin chào, {user.full_name || user.name} 🌿
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Stat label="Cây của bạn" value={stats.plants} />
        <Stat label="Tổng đơn hàng" value={stats.orders} />
        <Stat label="Tổng chi tiêu ($)" value={Number(stats.totalSpent).toFixed(2)} />
      </div>

      {/* ✅ Đơn hàng của bạn */}
      <section className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-green-700 mb-3">Đơn hàng của bạn</h2>

        <SortSearchFilterBar
          sortValue={sortBy}
          onSortChange={setSortBy}
          searchValue={search}
          onSearchChange={setSearch}
          statusValue={statusFilter}
          onStatusChange={setStatusFilter}
          statusOptions={statusOptions}
          searchPlaceholder="Tìm theo mã đơn / dịch vụ / cây / địa chỉ / SĐT"
        />

        {filteredSortedOrders.length === 0 ? (
          <p className="text-gray-500">Không có đơn phù hợp.</p>
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
              {filteredSortedOrders.map((o) => (
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

      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Chi tiết đơn #${selectedOrder?.id}`}
      >
        {selectedOrder && (
          <div className="space-y-2">
            <p><strong>Mã đơn:</strong> {selectedOrder.id}</p>
            <p><strong>Khách hàng:</strong> {selectedOrder.customer_name}</p>
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
