// client/src/pages/Admin/OrdersManagement.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import Modal from "../../components/ui/Modal";
import SortSearchFilterBar from "../../components/common/SortSearchFilterBar";

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

  // sort/search/filter
  const [sortBy, setSortBy] = useState("newest");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // staff assign modal
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignOrderId, setAssignOrderId] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [staffSearch, setStaffSearch] = useState("");

  const load = async () => {
    const res = await api.get("/admin/orders");
    setOrders(Array.isArray(res.data) ? res.data : []);
  };

  const loadStaff = async () => {
    const res = await api.get("/admin/staff");
    setStaffList(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => {
    load().catch(console.error);

    const interval = setInterval(() => load().catch(() => {}), 5000);
    return () => clearInterval(interval);
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

  const handleDeleteOrder = async (id) => {
    const ok = window.confirm(`Xóa vĩnh viễn đơn #${id} khỏi CSDL?`);
    if (!ok) return;
    try {
      await api.delete(`/admin/orders/${id}`);
      alert("Xóa đơn thành công!");
      load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Xóa đơn thất bại");
    }
  };

  const openAssign = async (orderId) => {
    setAssignOrderId(orderId);
    setAssignOpen(true);
    setStaffSearch("");
    await loadStaff();
  };

  const chooseStaff = async (staffId) => {
    try {
      await api.post("/assignments", {
        order_id: assignOrderId,
        staff_id: Number(staffId),
      });
      alert("Gán staff thành công!");
      setAssignOpen(false);
      setAssignOrderId(null);
      load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Gán staff thất bại");
    }
  };

  const statusOptions = useMemo(() => {
    const set = new Set(orders.map(o => o.status_vn || o.status));
    return Array.from(set);
  }, [orders]);

  const filteredSortedOrders = useMemo(() => {
    let list = [...orders];

    if (statusFilter !== "all") {
      list = list.filter(o => (o.status_vn || o.status || "").toLowerCase() === statusFilter.toLowerCase());
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        String(o.id).includes(q) ||
        (o.service_name || o.services || "").toLowerCase().includes(q) ||
        (o.customer_name || "").toLowerCase().includes(q) ||
        (o.address || "").toLowerCase().includes(q) ||
        (o.phone || o.customer_phone || "").toLowerCase().includes(q)
      );
    }

    const getDate = (o) => new Date(o.date || o.scheduled_date || 0).getTime();
    const getTotal = (o) => Number(o.total || o.total_price || 0);
    const getService = (o) => (o.service_name || o.services || "").toLowerCase();
    const getCustomer = (o) => (o.customer_name || "").toLowerCase();

    switch (sortBy) {
      case "customer_asc": list.sort((a,b)=>getCustomer(a).localeCompare(getCustomer(b))); break;
      case "customer_desc": list.sort((a,b)=>getCustomer(b).localeCompare(getCustomer(a))); break;
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

  const canAssignByStatus = (statusEn) => {
    return statusEn === "pending" || statusEn === "confirmed";
  };

  const filteredStaff = useMemo(() => {
    if (!staffSearch.trim()) return staffList;
    const q = staffSearch.toLowerCase();
    return staffList.filter(s =>
      String(s.id).includes(q) ||
      (s.full_name || s.name || "").toLowerCase().includes(q) ||
      (s.phone || "").toLowerCase().includes(q)
    );
  }, [staffList, staffSearch]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-4">Quản lý đơn hàng</h1>

      <SortSearchFilterBar
        sortValue={sortBy}
        onSortChange={setSortBy}
        searchValue={search}
        onSearchChange={setSearch}
        statusValue={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={statusOptions}
        searchPlaceholder="Tìm theo mã / dịch vụ / khách / địa chỉ / SĐT"
      />

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
            <th className="p-3 text-center">Xóa</th>
          </tr>
        </thead>

        <tbody>
          {filteredSortedOrders.map((o) => (
            <tr key={o.id} className="border-b hover:bg-green-50">
              <td className="p-3">{o.id}</td>
              <td className="p-3">{o.customer_name}</td>
              <td className="p-3">{o.service_name}</td>
              <td className="p-3">{new Date(o.date).toLocaleString()}</td>
              <td className="p-3">{o.address}</td>
              <td className="p-3">{o.phone || o.customer_phone || "—"}</td>
              <td className="p-3">${Number(o.total).toFixed(2)}</td>
              <td className="p-3 text-green-700">{o.status_vn}</td>

              <td className="p-3 text-center space-x-2">
                {canAssignByStatus(o.status) ? (
                  <button
                    onClick={() => openAssign(o.id)}
                    className="bg-purple-600 text-white px-3 py-1 rounded"
                  >
                    Gán
                  </button>
                ) : (
                  <span className="text-gray-400 text-sm">—</span>
                )}

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

              <td className="p-3 text-center">
                <button
                  onClick={() => handleDeleteOrder(o.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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

      <Modal
        isOpen={assignOpen}
        onClose={() => setAssignOpen(false)}
        title={`Gán nhân viên cho đơn #${assignOrderId}`}
      >
        <div className="space-y-3">
          <input
            className="border p-2 rounded w-full"
            placeholder="Tìm staff theo ID / tên / SĐT"
            value={staffSearch}
            onChange={(e)=>setStaffSearch(e.target.value)}
          />

          <div className="max-h-80 overflow-auto space-y-2">
            {filteredStaff.map(s => (
              <div key={s.id} className="border rounded p-2 flex justify-between items-center">
                <div>
                  <div className="font-semibold">#{s.id} — {s.full_name || s.name}</div>
                  <div className="text-sm text-gray-600">SĐT: {s.phone || "—"}</div>
                </div>
                <button
                  onClick={() => chooseStaff(s.id)}
                  className="px-3 py-1 bg-green-600 text-white rounded"
                >
                  Chọn
                </button>
              </div>
            ))}
            {filteredStaff.length === 0 && <p className="text-gray-500">Không có staff phù hợp.</p>}
          </div>
        </div>
      </Modal>
    </div>
  );
}
