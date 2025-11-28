// client/src/pages/staff/StaffDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import { Link } from "react-router-dom";
import SortSearchFilterBar from "../../components/common/SortSearchFilterBar";
import Modal from "../../components/ui/Modal";

export default function StaffDashboard() {
  const [available, setAvailable] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);

  const [sortAvailable, setSortAvailable] = useState("newest");
  const [searchAvailable, setSearchAvailable] = useState("");
  const [statusAvailable, setStatusAvailable] = useState("all");
  const [selectedAvailable, setSelectedAvailable] = useState(null);

  const [sortTasks, setSortTasks] = useState("newest");
  const [searchTasks, setSearchTasks] = useState("");
  const [statusTasks, setStatusTasks] = useState("all");
  const [selectedTask, setSelectedTask] = useState(null);

  const load = async () => {
    const av = await api.get("/staff/orders/available");
    setAvailable(av.data || []);

    const tk = await api.get("/staff/tasks");
    setTasks(tk.data || []);

    const st = await api.get("/staff/stats/income");
    setStats(st.data);
  };

  useEffect(() => {
    load().catch(console.error);

    // ✅ auto refresh
    const interval = setInterval(() => load().catch(() => {}), 5000);
    return () => clearInterval(interval);
  }, []);

  const accept = async (id) => {
    await api.put(`/staff/orders/${id}/accept`);
    load();
  };

  // ✅ FIX: staff hủy phải gọi route staff
  const cancelByStaffView = async (id) => {
    if (!confirm("Hủy đơn này?")) return;
    await api.put(`/staff/orders/${id}/cancel`);
    load();
  };

  const statusOptionsAvailable = useMemo(() => {
    const set = new Set(available.map((o) => o.status_vn || o.status));
    return Array.from(set);
  }, [available]);

  const statusOptionsTasks = useMemo(() => {
    const set = new Set(tasks.map((o) => o.status_vn || o.status));
    return Array.from(set);
  }, [tasks]);

  const sortFilter = (list, sortBy, search, statusFilter, searchFieldsFn) => {
    let arr = [...list];

    if (statusFilter !== "all") {
      arr = arr.filter((o) => {
        const st = (o.status_vn || o.status || "").toLowerCase();
        return st === statusFilter.toLowerCase();
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter((o) =>
        searchFieldsFn(o).some((v) =>
          String(v || "").toLowerCase().includes(q)
        )
      );
    }

    const getDate = (o) =>
      new Date(o.scheduled_date || o.date || o.created_at || 0).getTime();
    const getTotal = (o) => Number(o.total_price || o.total || 0);
    const getService = (o) =>
      (o.services || o.service_name || o.service || "").toLowerCase();

    switch (sortBy) {
      case "date_asc":
        arr.sort((a, b) => getDate(a) - getDate(b));
        break;
      case "date_desc":
        arr.sort((a, b) => getDate(b) - getDate(a));
        break;
      case "id_asc":
        arr.sort((a, b) => a.id - b.id);
        break;
      case "id_desc":
        arr.sort((a, b) => b.id - a.id);
        break;
      case "service_asc":
        arr.sort((a, b) => getService(a).localeCompare(getService(b)));
        break;
      case "service_desc":
        arr.sort((a, b) => getService(b).localeCompare(getService(a)));
        break;
      case "total_asc":
        arr.sort((a, b) => getTotal(a) - getTotal(b));
        break;
      case "total_desc":
        arr.sort((a, b) => getTotal(b) - getTotal(a));
        break;
      case "oldest":
        arr.sort((a, b) => getDate(a) - getDate(b));
        break;
      case "newest":
      default:
        arr.sort((a, b) => getDate(b) - getDate(a));
        break;
    }

    return arr;
  };

  const availableList = useMemo(
    () =>
      sortFilter(
        available,
        sortAvailable,
        searchAvailable,
        statusAvailable,
        (o) => [
          o.id,
          o.services,
          o.customer_name,
          o.plant_name,
          o.address,
          o.phone || o.customer_phone,
        ]
      ),
    [available, sortAvailable, searchAvailable, statusAvailable]
  );

  const tasksList = useMemo(
    () =>
      sortFilter(tasks, sortTasks, searchTasks, statusTasks, (o) => [
        o.id,
        o.services,
        o.customer_name,
        o.plant_name,
        o.address,
        o.phone || o.customer_phone,
      ]),
    [tasks, sortTasks, searchTasks, statusTasks]
  );

  return (
    <div className="min-h-screen bg-green-50 p-6 space-y-8">
      <h1 className="text-2xl font-bold text-green-700">
        Bảng điều khiển nhân viên
      </h1>

      {/* Stats + bonus */}
      {stats && (
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Thu nhập & Thưởng</h2>
          <div className="text-sm text-gray-600 mb-2">
            Thưởng mốc chẵn 2,4,6,8,10... sau mỗi đơn hoàn tất.
          </div>
          <ul className="text-sm list-disc pl-5">
            {stats.bonuses?.map((b) => (
              <li key={b.order_id}>
                Đơn #{b.order_id}: thưởng mốc {b.milestone} = ${b.bonus_amount}
              </li>
            ))}
            {(!stats.bonuses || stats.bonuses.length === 0) && (
              <li>Chưa có thưởng.</li>
            )}
          </ul>
        </div>
      )}

      {/* Available orders */}
      <section className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-3">Đơn chờ nhận</h2>

        <SortSearchFilterBar
          sortValue={sortAvailable}
          onSortChange={setSortAvailable}
          searchValue={searchAvailable}
          onSearchChange={setSearchAvailable}
          statusValue={statusAvailable}
          onStatusChange={setStatusAvailable}
          statusOptions={statusOptionsAvailable}
          searchPlaceholder="Tìm theo mã / dịch vụ / khách / cây / địa chỉ / SĐT"
        />

        {availableList.length === 0 ? (
          <p className="text-gray-500">Không có đơn mới.</p>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="bg-green-100 text-left">
                <th className="p-2">Mã đơn</th>
                <th className="p-2">Khách</th>
                <th className="p-2">Dịch vụ</th>
                <th className="p-2">Cây</th>
                <th className="p-2">Ngày hẹn</th>
                <th className="p-2">Địa chỉ</th>
                <th className="p-2">SĐT</th>
                <th className="p-2">Tổng</th>
                <th className="p-2">Trạng thái</th>
                <th className="p-2 text-center">Chi tiết</th>
                <th className="p-2 text-center">Hành động</th>
                <th className="p-2 text-center">Hủy</th>
              </tr>
            </thead>
            <tbody>
              {availableList.map((o) => (
                <tr key={o.id} className="border-b hover:bg-green-50">
                  <td className="p-2">{o.id}</td>
                  <td className="p-2">{o.customer_name}</td>
                  <td className="p-2">{o.services}</td>
                  <td className="p-2">{o.plant_name || "—"}</td>
                  <td className="p-2">
                    {new Date(o.scheduled_date).toLocaleString()}
                  </td>
                  <td className="p-2">{o.address}</td>
                  <td className="p-2">
                    {o.phone || o.customer_phone || "—"}
                  </td>
                  <td className="p-2">${o.total_price}</td>
                  <td className="p-2 text-green-700">
                    {o.status_vn || o.status}
                  </td>

                  <td className="p-2 text-center">
                    <button
                      onClick={() => setSelectedAvailable(o)}
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                    >
                      Xem
                    </button>
                  </td>

                  <td className="p-2 text-center">
                    <button
                      onClick={() => accept(o.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded"
                    >
                      Nhận đơn
                    </button>
                  </td>

                  <td className="p-2 text-center">
                    <button
                      onClick={() => cancelByStaffView(o.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                      Hủy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* My tasks */}
      <section className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-3">Đơn của tôi</h2>

        <SortSearchFilterBar
          sortValue={sortTasks}
          onSortChange={setSortTasks}
          searchValue={searchTasks}
          onSearchChange={setSearchTasks}
          statusValue={statusTasks}
          onStatusChange={setStatusTasks}
          statusOptions={statusOptionsTasks}
          searchPlaceholder="Tìm theo mã / dịch vụ / khách / cây / địa chỉ / SĐT"
        />

        {tasksList.length === 0 ? (
          <p className="text-gray-500">Chưa có đơn nào.</p>
        ) : (
          <div className="grid gap-3">
            {tasksList.map((t) => (
              <div
                key={t.id}
                className="border rounded-lg p-3 flex justify-between items-center hover:bg-green-50"
              >
                <div>
                  <div className="font-semibold">
                    Đơn #{t.id} — {t.services}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t.customer_name} • {t.address} •{" "}
                    {t.phone || t.customer_phone || "—"}
                  </div>
                  <div className="text-sm text-gray-600">
                    Cây: {t.plant_name || "—"}
                  </div>
                  <div className="text-sm text-green-700">
                    {t.status_vn || t.status}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedTask(t)}
                    className="px-3 py-1 bg-gray-700 text-white rounded"
                  >
                    Xem
                  </button>
                  <Link
                    to={`/staff/visit/${t.id}`}
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                  >
                    Chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal Chi tiết */}
      <Modal
        isOpen={!!selectedAvailable}
        onClose={() => setSelectedAvailable(null)}
        title={`Chi tiết đơn #${selectedAvailable?.id}`}
      >
        {selectedAvailable && (
          <div className="space-y-2">
            <p><strong>Mã đơn:</strong> {selectedAvailable.id}</p>
            <p><strong>Khách hàng:</strong> {selectedAvailable.customer_name}</p>
            <p><strong>Dịch vụ:</strong> {selectedAvailable.services}</p>
            <p><strong>Cây:</strong> {selectedAvailable.plant_name || "—"}</p>
            <p><strong>Ngày hẹn:</strong> {new Date(selectedAvailable.scheduled_date).toLocaleString()}</p>
            <p><strong>Địa chỉ:</strong> {selectedAvailable.address}</p>
            <p><strong>SĐT:</strong> {selectedAvailable.phone || selectedAvailable.customer_phone || "—"}</p>
            <p><strong>Tổng tiền:</strong> ${Number(selectedAvailable.total_price).toFixed(2)}</p>
            <p><strong>Trạng thái:</strong> {selectedAvailable.status_vn || selectedAvailable.status}</p>
            <p><strong>Voucher:</strong> {selectedAvailable.voucher_code || "—"}</p>
            <p><strong>Ghi chú:</strong> {selectedAvailable.note || "—"}</p>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title={`Chi tiết đơn #${selectedTask?.id}`}
      >
        {selectedTask && (
          <div className="space-y-2">
            <p><strong>Mã đơn:</strong> {selectedTask.id}</p>
            <p><strong>Khách hàng:</strong> {selectedTask.customer_name}</p>
            <p><strong>Dịch vụ:</strong> {selectedTask.services}</p>
            <p><strong>Cây:</strong> {selectedTask.plant_name || "—"}</p>
            <p><strong>Ngày hẹn:</strong> {new Date(selectedTask.scheduled_date).toLocaleString()}</p>
            <p><strong>Địa chỉ:</strong> {selectedTask.address}</p>
            <p><strong>SĐT:</strong> {selectedTask.phone || selectedTask.customer_phone || "—"}</p>
            <p><strong>Tổng tiền:</strong> ${Number(selectedTask.total_price).toFixed(2)}</p>
            <p><strong>Trạng thái:</strong> {selectedTask.status_vn || selectedTask.status}</p>
            <p><strong>Voucher:</strong> {selectedTask.voucher_code || "—"}</p>
            <p><strong>Ghi chú:</strong> {selectedTask.note || "—"}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
