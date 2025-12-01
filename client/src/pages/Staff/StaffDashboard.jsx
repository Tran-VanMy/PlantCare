// client/src/pages/staff/StaffDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import { Link } from "react-router-dom";
import SortSearchFilterBar from "../../components/common/SortSearchFilterBar";
import ScrollToTopButton from "../../components/ui/ScrollToTopButton";
import Modal from "../../components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";

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

  // -------- UI-only motion variants --------
  const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
  };
  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
  };
  const fastHover = {
    type: "spring",
    stiffness: 520,
    damping: 28,
    mass: 0.6,
  };

  // ✅ yêu cầu 3: >10 đơn thì cho scroll
  const shouldScrollAvailable = availableList.length > 10;
  const shouldScrollTasks = tasksList.length > 10;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/50 to-emerald-100/70 p-6 space-y-8">
      {/* Header */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <motion.h1
          variants={fadeUp}
          className="text-2xl md:text-3xl font-extrabold text-emerald-900 flex items-center gap-2"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-md shadow-emerald-700/30">
            👨‍🌾
          </span>
          Bảng điều khiển nhân viên
        </motion.h1>

        <motion.div
          variants={fadeUp}
          className="text-sm font-semibold text-emerald-900/80 bg-white/80 border border-emerald-200 rounded-xl px-3 py-2 shadow-sm"
        >
          ⏱️ Tự động làm mới mỗi 5s
        </motion.div>
      </motion.div>

      {/* Stats + bonus */}
      {stats && (
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="bg-white p-5 rounded-2xl shadow-lg shadow-emerald-900/5 border border-emerald-100"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">💰</span>
            <h2 className="font-extrabold text-emerald-900 text-lg">
              Thu nhập & Thưởng
            </h2>
          </div>

          <div className="text-sm text-gray-700 mb-3 font-medium">
            Thưởng mốc chẵn 2,4,6,8,10... sau mỗi đơn hoàn tất.
          </div>

          <ul className="text-sm list-disc pl-5 space-y-1">
            {stats.bonuses?.map((b) => (
              <li key={b.order_id} className="text-gray-800 font-semibold">
                Đơn #{b.order_id}: thưởng mốc {b.milestone} ={" "}
                <span className="text-emerald-800 font-extrabold">
                  ${b.bonus_amount}
                </span>
              </li>
            ))}
            {(!stats.bonuses || stats.bonuses.length === 0) && (
              <li className="text-gray-600">Chưa có thưởng.</li>
            )}
          </ul>
        </motion.section>
      )}

      {/* Available orders */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="bg-white p-5 rounded-2xl shadow-lg shadow-emerald-900/5 border border-emerald-100"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">📥</span>
          <h2 className="text-lg font-extrabold text-emerald-900">
            Đơn chờ nhận
          </h2>
        </div>

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
          <div className="mt-4 text-gray-600 font-medium flex items-center gap-2">
            <span>🌿</span> Không có đơn mới.
          </div>
        ) : (
          <div
            className={`mt-3 rounded-xl border border-emerald-100 overflow-hidden ${
              shouldScrollAvailable ? "max-h-[520px] overflow-auto" : ""
            }`}
          >
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-emerald-100 text-left text-emerald-950">
                  <th className="p-3 font-extrabold">Mã đơn</th>
                  <th className="p-3 font-extrabold">Khách</th>
                  <th className="p-3 font-extrabold">Dịch vụ</th>
                  <th className="p-3 font-extrabold">Cây</th>
                  <th className="p-3 font-extrabold">Ngày hẹn</th>
                  <th className="p-3 font-extrabold">Địa chỉ</th>
                  <th className="p-3 font-extrabold">SĐT</th>
                  <th className="p-3 font-extrabold">Tổng</th>
                  <th className="p-3 font-extrabold">Trạng thái</th>
                  <th className="p-3 font-extrabold text-center">Chi tiết</th>
                  <th className="p-3 font-extrabold text-center">Hành động</th>
                  <th className="p-3 font-extrabold text-center">Hủy</th>
                </tr>
              </thead>

              <motion.tbody
                variants={stagger}
                initial="hidden"
                animate="show"
              >
                {availableList.map((o) => (
                  <motion.tr
                    key={o.id}
                    variants={fadeUp}
                    whileHover={{ backgroundColor: "rgba(16,185,129,0.06)" }}
                    transition={{ duration: 0.15 }}
                    className="border-b last:border-b-0"
                  >
                    <td className="p-3 font-semibold text-gray-900">{o.id}</td>
                    <td className="p-3">{o.customer_name}</td>
                    <td className="p-3">{o.services}</td>
                    <td className="p-3">{o.plant_name || "—"}</td>
                    <td className="p-3">
                      {new Date(o.scheduled_date).toLocaleString()}
                    </td>
                    <td className="p-3">{o.address}</td>
                    <td className="p-3">
                      {o.phone || o.customer_phone || "—"}
                    </td>
                    <td className="p-3 font-extrabold text-emerald-800">
                      ${o.total_price}
                    </td>
                    <td className="p-3 font-bold text-emerald-700">
                      {o.status_vn || o.status}
                    </td>

                    <td className="p-3 text-center">
                      <motion.button
                        whileHover={{ y: -2, scale: 1.03 }}
                        transition={fastHover}
                        onClick={() => setSelectedAvailable(o)}
                        className="px-3 py-1.5 bg-sky-600 text-white rounded-lg font-semibold shadow hover:bg-sky-700 active:scale-95 transition"
                      >
                        👁️ Xem
                      </motion.button>
                    </td>

                    <td className="p-3 text-center">
                      <motion.button
                        whileHover={{ y: -2, scale: 1.03 }}
                        transition={fastHover}
                        onClick={() => accept(o.id)}
                        className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg font-semibold shadow hover:bg-emerald-800 active:scale-95 transition"
                      >
                        ✅ Nhận đơn
                      </motion.button>
                    </td>

                    <td className="p-3 text-center">
                      <motion.button
                        whileHover={{ y: -2, scale: 1.03 }}
                        transition={fastHover}
                        onClick={() => cancelByStaffView(o.id)}
                        className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-semibold shadow hover:bg-rose-700 active:scale-95 transition"
                      >
                        ❌ Hủy
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        )}
      </motion.section>

      {/* My tasks */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="bg-white p-5 rounded-2xl shadow-lg shadow-emerald-900/5 border border-emerald-100"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🧾</span>
          <h2 className="text-lg font-extrabold text-emerald-900">
            Đơn của tôi
          </h2>
        </div>

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
          <div className="mt-4 text-gray-600 font-medium flex items-center gap-2">
            <span>🌱</span> Chưa có đơn nào.
          </div>
        ) : (
          <div
            className={`mt-3 grid gap-3 ${
              shouldScrollTasks ? "max-h-[520px] overflow-auto pr-1" : ""
            }`}
          >
            <AnimatePresence>
              {tasksList.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.25 }}
                  whileHover={{ y: -3, scale: 1.01 }}
                  className="border border-emerald-100 rounded-2xl p-4 flex justify-between items-center bg-white hover:bg-emerald-50/60 shadow-sm hover:shadow-md transition transform-gpu will-change-transform"
                >
                  <div className="space-y-1">
                    <div className="font-extrabold text-gray-900">
                      Đơn #{t.id} — {t.services}
                    </div>
                    <div className="text-sm text-gray-700 font-medium">
                      👤 {t.customer_name} • 📍 {t.address} • ☎️{" "}
                      {t.phone || t.customer_phone || "—"}
                    </div>
                    <div className="text-sm text-gray-700 font-medium">
                      🪴 Cây: {t.plant_name || "—"}
                    </div>
                    <div className="text-sm font-bold text-emerald-700">
                      {t.status_vn || t.status}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ y: -2, scale: 1.04 }}
                      transition={fastHover}
                      onClick={() => setSelectedTask(t)}
                      className="px-3 py-1.5 bg-gray-800 text-white rounded-lg font-semibold shadow hover:bg-gray-900 active:scale-95 transition"
                    >
                      👁️ Xem
                    </motion.button>

                    <Link
                      to={`/staff/visit/${t.id}`}
                      className="px-3 py-1.5 bg-sky-600 text-white rounded-lg font-semibold shadow hover:bg-sky-700 active:scale-95 transition"
                    >
                      📌 Chi tiết
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.section>

      {/* Modal Chi tiết - Available */}
      <Modal
        isOpen={!!selectedAvailable}
        onClose={() => setSelectedAvailable(null)}
        title={`Chi tiết đơn #${selectedAvailable?.id}`}
      >
        <AnimatePresence mode="wait">
          {selectedAvailable && (
            <motion.div
              key={selectedAvailable.id}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="space-y-3 text-sm"
            >
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="font-extrabold text-emerald-900 text-base flex items-center gap-2">
                  🧾 Đơn #{selectedAvailable.id}
                </div>
                <div className="text-xs text-gray-700 font-semibold mt-1">
                  Trạng thái:{" "}
                  <span className="text-emerald-800">
                    {selectedAvailable.status_vn || selectedAvailable.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoLine label="👤 Khách hàng" value={selectedAvailable.customer_name} />
                <InfoLine label="☎️ SĐT" value={selectedAvailable.phone || selectedAvailable.customer_phone || "—"} />
                <InfoLine label="🪴 Cây" value={selectedAvailable.plant_name || "—"} />
                <InfoLine label="📍 Địa chỉ" value={selectedAvailable.address} />
                <InfoLine label="🗓️ Ngày hẹn" value={new Date(selectedAvailable.scheduled_date).toLocaleString()} />
                <InfoLine label="🏷️ Voucher" value={selectedAvailable.voucher_code || "—"} />
              </div>

              <div className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
                <div className="text-xs font-bold text-gray-600">🛠️ Dịch vụ</div>
                <div className="mt-1 font-semibold text-gray-900">
                  {selectedAvailable.services}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
                <div className="text-xs font-bold text-gray-600">📝 Ghi chú</div>
                <div className="mt-1 font-semibold text-gray-900 whitespace-pre-wrap">
                  {selectedAvailable.note || "—"}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900 font-extrabold">
                💵 Tổng tiền: ${Number(selectedAvailable.total_price).toFixed(2)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>

      {/* Modal Chi tiết - Task */}
      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title={`Chi tiết đơn #${selectedTask?.id}`}
      >
        <AnimatePresence mode="wait">
          {selectedTask && (
            <motion.div
              key={selectedTask.id}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="space-y-3 text-sm"
            >
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="font-extrabold text-emerald-900 text-base flex items-center gap-2">
                  🧾 Đơn #{selectedTask.id}
                </div>
                <div className="text-xs text-gray-700 font-semibold mt-1">
                  Trạng thái:{" "}
                  <span className="text-emerald-800">
                    {selectedTask.status_vn || selectedTask.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoLine label="👤 Khách hàng" value={selectedTask.customer_name} />
                <InfoLine label="☎️ SĐT" value={selectedTask.phone || selectedTask.customer_phone || "—"} />
                <InfoLine label="🪴 Cây" value={selectedTask.plant_name || "—"} />
                <InfoLine label="📍 Địa chỉ" value={selectedTask.address} />
                <InfoLine label="🗓️ Ngày hẹn" value={new Date(selectedTask.scheduled_date).toLocaleString()} />
                <InfoLine label="🏷️ Voucher" value={selectedTask.voucher_code || "—"} />
              </div>

              <div className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
                <div className="text-xs font-bold text-gray-600">🛠️ Dịch vụ</div>
                <div className="mt-1 font-semibold text-gray-900">
                  {selectedTask.services}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
                <div className="text-xs font-bold text-gray-600">📝 Ghi chú</div>
                <div className="mt-1 font-semibold text-gray-900 whitespace-pre-wrap">
                  {selectedTask.note || "—"}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900 font-extrabold">
                💵 Tổng tiền: ${Number(selectedTask.total_price).toFixed(2)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>

      <ScrollToTopButton />
    </div>
  );
}

/* ---------- UI-only small components ---------- */
function InfoLine({ label, value }) {
  return (
    <div className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition">
      <div className="text-[11px] font-extrabold text-gray-600">{label}</div>
      <div className="mt-1 font-semibold text-gray-900">{value}</div>
    </div>
  );
}
