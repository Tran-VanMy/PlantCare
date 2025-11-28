// client/src/pages/Customer/OrderHistory.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import Modal from "../../components/ui/Modal";
import SortSearchFilterBar from "../../components/common/SortSearchFilterBar";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [sortBy, setSortBy] = useState("newest");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
      .catch(console.error)
      .finally(() => setLoading(false));

    // ✅ auto refresh (req11,13,14,19)
    const interval = setInterval(() => {
      fetchOrders(storedUser.id).catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const cancelOrder = async (id) => {
    if (!confirm("Bạn chắc chắn muốn hủy đơn này?")) return;
    await api.put(`/orders/${id}/cancel`);
    const storedUser = JSON.parse(localStorage.getItem("user"));
    fetchOrders(storedUser.id);
  };

  const statusOptions = useMemo(() => {
    const set = new Set(orders.map(o => o.status));
    return Array.from(set);
  }, [orders]);

  const filteredSortedOrders = useMemo(() => {
    let list = [...orders];

    if (statusFilter !== "all") {
      list = list.filter(o => (o.status || "").toLowerCase() === statusFilter.toLowerCase());
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        String(o.id).includes(q) ||
        (o.service || "").toLowerCase().includes(q) ||
        (o.plant || "").toLowerCase().includes(q) ||
        (o.address || "").toLowerCase().includes(q) ||
        (o.phone || "").toLowerCase().includes(q)
      );
    }

    const getDate = (o) => new Date(o.date || o.scheduled_date || 0).getTime();
    const getTotal = (o) => Number(o.total || 0);
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

  if (loading) return <p>Đang tải đơn hàng...</p>;

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-4">🧾 Lịch sử đơn hàng</h1>

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
        <p>Bạn chưa có đơn hàng nào.</p>
      ) : (
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
