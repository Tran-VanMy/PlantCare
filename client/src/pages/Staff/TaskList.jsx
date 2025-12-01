// client/src/pages/Staff/TaskList.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";
import SortSearchFilterBar from "../../components/common/SortSearchFilterBar";
import ScrollToTopButton from "../../components/ui/ScrollToTopButton";
import Modal from "../../components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";

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
    const set = new Set(tasks.map((t) => t.status_vn || t.status));
    return Array.from(set);
  }, [tasks]);

  const filteredSorted = useMemo(() => {
    let arr = [...tasks];

    if (statusFilter !== "all") {
      arr = arr.filter(
        (t) =>
          (t.status_vn || t.status || "").toLowerCase() ===
          statusFilter.toLowerCase()
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (t) =>
          String(t.id).includes(q) ||
          (t.services || t.service_name || "")
            .toLowerCase()
            .includes(q) ||
          (t.customer_name || "").toLowerCase().includes(q) ||
          (t.plant_name || "").toLowerCase().includes(q) ||
          (t.address || "").toLowerCase().includes(q) ||
          (t.phone || t.customer_phone || "").toLowerCase().includes(q)
      );
    }

    const getDate = (t) =>
      new Date(t.scheduled_date || t.date || 0).getTime();
    const getTotal = (t) => Number(t.total_price || t.total || 0);
    const getService = (t) =>
      (t.services || t.service_name || "").toLowerCase();
    const getCustomer = (t) => (t.customer_name || "").toLowerCase();

    switch (sortBy) {
      case "customer_asc":
        arr.sort((a, b) => getCustomer(a).localeCompare(getCustomer(b)));
        break;
      case "customer_desc":
        arr.sort((a, b) => getCustomer(b).localeCompare(getCustomer(a)));
        break;
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
  }, [tasks, sortBy, search, statusFilter]);

  // ✅ yêu cầu 3: khi > 10 đơn thì hiện scroll
  const shouldScroll = filteredSorted.length > 10;

  // motion variants (UI only)
  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" },
    },
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/50 to-emerald-100/70 p-6">
      {/* Header */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mb-4 flex items-center justify-between flex-wrap gap-3"
      >
        <motion.h1
          variants={fadeUp}
          className="text-2xl md:text-3xl font-extrabold text-emerald-900 flex items-center gap-2"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-md shadow-emerald-700/30">
            📋
          </span>
          Danh sách nhiệm vụ
        </motion.h1>

        <motion.div
          variants={fadeUp}
          className="text-sm font-semibold text-emerald-900/80 bg-white/80 border border-emerald-200 rounded-xl px-3 py-2 shadow-sm"
        >
          ⏱️ Tự động làm mới mỗi 5s
        </motion.div>
      </motion.div>

      {/* override options for task page */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="mb-2 text-sm text-gray-700 font-medium"
      >
        Sắp xếp theo tên khách / ngày / mã / dịch vụ / tổng tiền / mới nhất / cũ
        nhất
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="show">
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
      </motion.div>

      {/* List container */}
      <div
        className={`mt-3 grid gap-3 ${
          shouldScroll ? "max-h-[520px] overflow-auto pr-1" : ""
        }`}
      >
        <AnimatePresence>
          {filteredSorted.map((t) => (
            <motion.div
              key={t.id}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: 8 }}
              whileHover={{ y: -3, scale: 1.01 }}
              transition={fastHover}
              className="
                bg-white p-4 rounded-2xl
                shadow-sm hover:shadow-md
                border border-emerald-100
                flex justify-between items-center
                hover:bg-emerald-50/60
                transition transform-gpu will-change-transform
              "
            >
              {/* LEFT */}
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-gray-900">
                  Đơn #{t.id} — {t.services}
                </h3>

                <p className="text-gray-700 text-sm font-medium">
                  👤 Khách: {t.customer_name}
                </p>
                <p className="text-gray-700 text-sm font-medium">
                  ☎️ SĐT: {t.phone || t.customer_phone || "—"}
                </p>
                <p className="text-gray-700 text-sm font-medium">
                  📍 Địa chỉ: {t.address}
                </p>
                <p className="text-gray-700 text-sm font-medium">
                  🪴 Cây: {t.plant_name || "—"}
                </p>
                <p className="text-gray-700 text-sm font-medium">
                  🗓️ Ngày hẹn: {new Date(t.scheduled_date).toLocaleString()}
                </p>
                <p className="text-gray-700 text-sm font-medium">
                  💵 Tổng:{" "}
                  <span className="text-emerald-800 font-extrabold">
                    ${t.total_price}
                  </span>
                </p>
              </div>

              {/* RIGHT */}
              <div className="flex flex-col items-end gap-2">
                <span className="text-sm font-bold text-emerald-700">
                  {t.status_vn || t.status}
                </span>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ y: -2, scale: 1.04 }}
                    transition={fastHover}
                    onClick={() => setSelected(t)}
                    className="px-3 py-1.5 bg-gray-800 text-white rounded-lg font-semibold shadow hover:bg-gray-900 active:scale-95 transition"
                  >
                    👁️ Xem
                  </motion.button>

                  <Link
                    to={`/staff/visit/${t.id}`}
                    className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg font-semibold shadow hover:bg-emerald-800 active:scale-95 transition"
                  >
                    📌 Chi tiết
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredSorted.length === 0 && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-gray-600 font-medium py-6"
          >
            🌿 Không có nhiệm vụ.
          </motion.p>
        )}
      </div>

      {/* Modal quick detail */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={`Chi tiết đơn #${selected?.id}`}
      >
        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="space-y-3 text-sm"
            >
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="font-extrabold text-emerald-900 text-base flex items-center gap-2">
                  🧾 Đơn #{selected.id}
                </div>
                <div className="text-xs text-gray-700 font-semibold mt-1">
                  Trạng thái:{" "}
                  <span className="text-emerald-800">
                    {selected.status_vn || selected.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoLine label="👤 Khách hàng" value={selected.customer_name} />
                <InfoLine
                  label="☎️ SĐT"
                  value={selected.phone || selected.customer_phone || "—"}
                />
                <InfoLine label="🪴 Cây" value={selected.plant_name || "—"} />
                <InfoLine label="📍 Địa chỉ" value={selected.address} />
                <InfoLine
                  label="🗓️ Ngày hẹn"
                  value={new Date(selected.scheduled_date).toLocaleString()}
                />
                <InfoLine
                  label="🏷️ Voucher"
                  value={selected.voucher_code || "—"}
                />
              </div>

              <div className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
                <div className="text-xs font-bold text-gray-600">🛠️ Dịch vụ</div>
                <div className="mt-1 font-semibold text-gray-900">
                  {selected.services}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
                <div className="text-xs font-bold text-gray-600">📝 Ghi chú</div>
                <div className="mt-1 font-semibold text-gray-900 whitespace-pre-wrap">
                  {selected.note || "—"}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900 font-extrabold">
                💵 Tổng tiền: ${Number(selected.total_price).toFixed(2)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>

      <ScrollToTopButton />
    </div>
  );
}

/* ---------- UI-only small component ---------- */
function InfoLine({ label, value }) {
  return (
    <div className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition">
      <div className="text-[11px] font-extrabold text-gray-600">{label}</div>
      <div className="mt-1 font-semibold text-gray-900">{value}</div>
    </div>
  );
}
