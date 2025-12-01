// client/src/pages/staff/TaskHistory.jsx
import { useEffect, useState, useMemo } from "react";
import ScrollToTopButton from "../../components/ui/ScrollToTopButton";
import api from "../../api/api";
import Modal from "../../components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";

export default function TaskHistory() {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    const res = await api.get("/staff/tasks/history");
    setHistory(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => {
    load().catch(console.error);

    // ✅ auto refresh để thấy ngay sau hoàn tất (req15)
    const interval = setInterval(() => load().catch(() => {}), 5000);
    return () => clearInterval(interval);
  }, []);

  // ✅ yêu cầu 3: scroll khi > 10 đơn
  const shouldScroll = history.length > 10;

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

  const rows = useMemo(() => history, [history]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/50 to-emerald-100/70 p-6">
      {/* Header */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mb-5 flex items-center justify-between flex-wrap gap-3"
      >
        <motion.h1
          variants={fadeUp}
          className="text-2xl md:text-3xl font-extrabold text-emerald-900 flex items-center gap-2"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-md shadow-emerald-700/30">
            📜
          </span>
          Lịch sử công việc
        </motion.h1>

        <motion.div
          variants={fadeUp}
          className="text-sm font-semibold text-emerald-900/80 bg-white/80 border border-emerald-200 rounded-xl px-3 py-2 shadow-sm"
        >
          ⏱️ Tự động làm mới mỗi 5s
        </motion.div>
      </motion.div>

      {rows.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-emerald-100 shadow-md p-8 text-center max-w-md"
        >
          <div className="text-5xl mb-3">🪴</div>
          <h2 className="text-xl font-extrabold text-emerald-900">
            Chưa có lịch sử
          </h2>
          <p className="text-gray-700 mt-2 text-sm font-medium">
            Khi bạn hoàn tất đơn, lịch sử sẽ hiển thị tại đây.
          </p>
        </motion.div>
      ) : (
        <div
          className={`bg-white rounded-2xl border border-emerald-100 shadow-lg overflow-hidden ${
            shouldScroll ? "max-h-[560px] overflow-auto" : ""
          }`}
        >
          <table className="min-w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-500 text-left text-white">
                <th className="p-3 text-sm font-extrabold">Mã đơn</th>
                <th className="p-3 text-sm font-extrabold">Khách hàng</th>
                <th className="p-3 text-sm font-extrabold">Ngày hẹn</th>
                <th className="p-3 text-sm font-extrabold">Địa chỉ</th>
                <th className="p-3 text-sm font-extrabold">SĐT</th>
                <th className="p-3 text-sm font-extrabold">Tổng</th>
                <th className="p-3 text-sm font-extrabold">Trạng thái</th>
                <th className="p-3 text-sm font-extrabold text-center">
                  Chi tiết
                </th>
              </tr>
            </thead>

            <tbody>
              <AnimatePresence>
                {rows.map((o, idx) => (
                  <motion.tr
                    key={o.id}
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, y: 6 }}
                    whileHover={{ backgroundColor: "rgba(16,185,129,0.06)" }}
                    transition={fastHover}
                    className={`border-b last:border-b-0 cursor-pointer`}
                    onClick={() => setSelected(o)}
                  >
                    <td className="p-3 font-semibold text-gray-900">
                      #{o.id}
                    </td>
                    <td className="p-3 text-gray-800 font-medium">
                      {o.customer_name}
                    </td>
                    <td className="p-3 text-gray-700 font-medium">
                      {new Date(o.scheduled_date).toLocaleString()}
                    </td>
                    <td className="p-3 text-gray-700 font-medium line-clamp-1">
                      {o.address}
                    </td>
                    <td className="p-3 text-gray-700 font-medium">
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
                        whileHover={{ y: -2, scale: 1.05 }}
                        transition={fastHover}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(o);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-semibold shadow hover:bg-emerald-800 active:scale-95 transition"
                      >
                        👁️ Xem
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Modal chi tiết */}
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

/* ---------- UI-only component ---------- */
function InfoLine({ label, value }) {
  return (
    <div className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition">
      <div className="text-[11px] font-extrabold text-gray-600">{label}</div>
      <div className="mt-1 font-semibold text-gray-900">{value}</div>
    </div>
  );
}
