// client/src/pages/Staff/TaskList.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";
import SortSearchFilterBar from "../../components/common/SortSearchFilterBar";
import Modal from "../../components/ui/Modal";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const load = async () => {
    const res = await api.get("/staff/tasks");
    setTasks(res.data || []);
  };

  useEffect(() => {
    load().catch(console.error);

    // ✅ auto refresh (req9,11,14)
    const interval = setInterval(() => load().catch(() => {}), 5000);
    return () => clearInterval(interval);
  }, []);

  const statusOptions = useMemo(() => {
    const set = new Set(tasks.map(t => t.status_vn || t.status));
    return Array.from(set);
  }, [tasks]);

  const filteredSorted = useMemo(() => {
    let arr = [...tasks];

    if (statusFilter !== "all") {
      arr = arr.filter(t => (t.status_vn || t.status || "").toLowerCase() === statusFilter.toLowerCase());
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(t =>
        String(t.id).includes(q) ||
        (t.services || t.service_name || "").toLowerCase().includes(q) ||
        (t.customer_name || "").toLowerCase().includes(q) ||
        (t.plant_name || "").toLowerCase().includes(q) ||
        (t.address || "").toLowerCase().includes(q) ||
        (t.phone || t.customer_phone || "").toLowerCase().includes(q)
      );
    }

    const getDate = (t) => new Date(t.scheduled_date || t.date || 0).getTime();
    const getTotal = (t) => Number(t.total_price || t.total || 0);
    const getService = (t) => (t.services || t.service_name || "").toLowerCase();
    const getCustomer = (t) => (t.customer_name || "").toLowerCase();

    switch (sortBy) {
      case "customer_asc": arr.sort((a,b)=>getCustomer(a).localeCompare(getCustomer(b))); break;
      case "customer_desc": arr.sort((a,b)=>getCustomer(b).localeCompare(getCustomer(a))); break;
      case "date_asc": arr.sort((a,b)=>getDate(a)-getDate(b)); break;
      case "date_desc": arr.sort((a,b)=>getDate(b)-getDate(a)); break;
      case "id_asc": arr.sort((a,b)=>a.id-b.id); break;
      case "id_desc": arr.sort((a,b)=>b.id-a.id); break;
      case "service_asc": arr.sort((a,b)=>getService(a).localeCompare(getService(b))); break;
      case "service_desc": arr.sort((a,b)=>getService(b).localeCompare(getService(a))); break;
      case "total_asc": arr.sort((a,b)=>getTotal(a)-getTotal(b)); break;
      case "total_desc": arr.sort((a,b)=>getTotal(b)-getTotal(a)); break;
      case "oldest": arr.sort((a,b)=>getDate(a)-getDate(b)); break;
      case "newest":
      default: arr.sort((a,b)=>getDate(b)-getDate(a)); break;
    }

    return arr;
  }, [tasks, sortBy, search, statusFilter]);

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-4">Danh sách nhiệm vụ</h1>

      {/* override options for task page */}
      <div className="mb-2 text-sm text-gray-600">
        Sắp xếp theo tên khách / ngày / mã / dịch vụ / tổng tiền / mới nhất / cũ nhất
      </div>

      <SortSearchFilterBar
        sortValue={sortBy}
        onSortChange={setSortBy}
        searchValue={search}
        onSearchChange={setSearch}
        statusValue={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={statusOptions}
        searchPlaceholder="Tìm theo mã / dịch vụ / khách / cây / địa chỉ / SĐT"
      />

      <div className="grid gap-3">
        {filteredSorted.map((t) => (
          <div
            key={t.id}
            className="bg-white p-4 rounded-lg shadow flex justify-between items-center hover:bg-green-50"
          >
            <div>
              <h3 className="text-lg font-semibold">
                Đơn #{t.id} — {t.services}
              </h3>
              <p className="text-gray-600 text-sm">Khách: {t.customer_name}</p>
              <p className="text-gray-600 text-sm">SĐT: {t.phone || t.customer_phone || "—"}</p>
              <p className="text-gray-600 text-sm">Địa chỉ: {t.address}</p>
              <p className="text-gray-600 text-sm">Cây: {t.plant_name || "—"}</p>
              <p className="text-gray-600 text-sm">
                Ngày hẹn: {new Date(t.scheduled_date).toLocaleString()}
              </p>
              <p className="text-gray-600 text-sm">Tổng: ${t.total_price}</p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className="text-sm text-green-700">{t.status_vn || t.status}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelected(t)}
                  className="px-3 py-1 bg-gray-700 text-white rounded"
                >
                  Xem
                </button>
                <Link
                  to={`/staff/visit/${t.id}`}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Chi tiết
                </Link>
              </div>
            </div>
          </div>
        ))}

        {filteredSorted.length === 0 && (
          <p className="text-center text-gray-500">Không có nhiệm vụ.</p>
        )}
      </div>

      {/* Modal quick detail */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={`Chi tiết đơn #${selected?.id}`}
      >
        {selected && (
          <div className="space-y-2">
            <p><strong>Mã đơn:</strong> {selected.id}</p>
            <p><strong>Khách hàng:</strong> {selected.customer_name}</p>
            <p><strong>Dịch vụ:</strong> {selected.services}</p>
            <p><strong>Cây:</strong> {selected.plant_name || "—"}</p>
            <p><strong>Ngày hẹn:</strong> {new Date(selected.scheduled_date).toLocaleString()}</p>
            <p><strong>Địa chỉ:</strong> {selected.address}</p>
            <p><strong>SĐT:</strong> {selected.phone || selected.customer_phone || "—"}</p>
            <p><strong>Tổng tiền:</strong> ${Number(selected.total_price).toFixed(2)}</p>
            <p><strong>Trạng thái:</strong> {selected.status_vn || selected.status}</p>
            <p><strong>Voucher:</strong> {selected.voucher_code || "—"}</p>
            <p><strong>Ghi chú:</strong> {selected.note || "—"}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
