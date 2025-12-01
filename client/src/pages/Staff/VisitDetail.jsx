// client/src/pages/Staff/VisitDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ScrollToTopButton from "../../components/ui/ScrollToTopButton";
import api from "../../api/api";
import { motion, AnimatePresence } from "framer-motion";

export default function VisitDetail() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/staff/tasks/${id}`);
      setTask(res.data);
    } catch (err) {
      console.error("load visit detail error", err);
      setTask(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(() => load().catch(() => {}), 20000);
    return () => clearInterval(interval);
  }, [id]);

  // ✅ luôn tính an toàn dù task=null (KHÔNG dùng hook)
  const statusVN = task?.status_vn || task?.status || "";

  const getStatusStyle = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "đã nhận") return "bg-amber-100 text-amber-900 border-amber-200";
    if (s === "đang di chuyển") return "bg-blue-100 text-blue-900 border-blue-200";
    if (s === "đang chăm") return "bg-emerald-100 text-emerald-900 border-emerald-200";
    if (s === "hoàn tất") return "bg-gray-100 text-gray-900 border-gray-200";
    return "bg-emerald-50 text-emerald-900 border-emerald-100";
  };

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
  const springFast = { type: "spring", stiffness: 520, damping: 28, mass: 0.7 };

  // ✅ giữ nguyên logic cũ
  const canMove = statusVN === "Đã nhận";
  const canCare = statusVN === "Đang di chuyển";
  const canComplete = statusVN === "Đang chăm";

  // ---------------- UI RENDER ----------------
  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/50 to-emerald-100/70 p-6">
        <div className="max-w-4xl mx-auto animate-pulse space-y-4">
          <div className="h-8 w-64 bg-emerald-200/70 rounded-xl" />
          <div className="bg-white rounded-3xl border border-emerald-100 shadow-lg p-6 space-y-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-100 rounded-lg w-full" />
            ))}
            <div className="h-12 bg-gray-100 rounded-xl w-1/2 mt-4" />
          </div>
        </div>
      </div>
    );

  if (!task)
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/50 to-emerald-100/70 p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="bg-white rounded-2xl border border-emerald-100 shadow-md p-8 text-center max-w-md"
        >
          <div className="text-5xl mb-3">😵‍💫</div>
          <h2 className="text-xl font-extrabold text-emerald-900">
            Không tìm thấy công việc
          </h2>
          <p className="text-gray-700 mt-2 text-sm font-medium">
            Đơn có thể đã bị hủy hoặc bạn không còn quyền truy cập.
          </p>
        </motion.div>
      </div>
    );

  const move = async () => {
    await api.put(`/staff/orders/${id}/move`);
    load();
  };

  const startCare = async () => {
    await api.put(`/staff/orders/${id}/care`);
    load();
  };

  const complete = async () => {
    await api.put(`/staff/orders/${id}/complete`);
    load();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/50 to-emerald-100/70 p-6">
      <div className="max-w-4xl mx-auto space-y-5">
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
              🧑‍🔧
            </span>
            Chi tiết công việc #{id}
          </motion.h1>

          <motion.div
            variants={fadeUp}
            className={`px-3 py-1.5 rounded-full text-sm font-extrabold border shadow-sm ${getStatusStyle(
              statusVN
            )}`}
          >
            {statusVN}
          </motion.div>
        </motion.div>

        {/* Main Card */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="bg-white rounded-3xl border border-emerald-100 shadow-xl overflow-hidden"
        >
          <div className="h-1.5 bg-gradient-to-r from-emerald-700 via-green-500 to-lime-400" />

          <div className="p-6 md:p-7 space-y-5">
            {/* Info Grid */}
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              <InfoCard icon="👤" label="Khách hàng" value={task.customer_name} />
              <InfoCard
                icon="☎️"
                label="Số điện thoại"
                value={task.phone || task.customer_phone || "—"}
              />
              <InfoCard icon="📍" label="Địa chỉ" value={task.address} />
              <InfoCard
                icon="🗓️"
                label="Ngày thực hiện"
                value={new Date(task.scheduled_date).toLocaleString()}
              />
              <InfoCard icon="🛠️" label="Dịch vụ" value={task.services} />
              <InfoCard
                icon="🪴"
                label="Cây"
                value={task.plant_name || task.plant || "—"}
              />
              <InfoCard
                icon="🏷️"
                label="Voucher"
                value={task.voucher_code || task.voucher || "—"}
              />
              <InfoCard
                icon="🧾"
                label="Trạng thái"
                value={statusVN}
                highlight
              />
            </motion.div>

            {/* Note */}
            <motion.div
              variants={fadeUp}
              className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100"
            >
              <div className="text-xs font-extrabold text-emerald-900 flex items-center gap-1">
                📝 Ghi chú
              </div>
              <div className="mt-1 text-sm font-semibold text-gray-900 whitespace-pre-wrap">
                {task.note || "—"}
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div variants={fadeUp} className="pt-2">
              <div className="text-sm font-extrabold text-gray-900 mb-2 flex items-center gap-2">
                ⚡ Hành động
              </div>

              <div className="flex flex-wrap gap-3">
                {canMove && (
                  <motion.button
                    whileHover={{ y: -2, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={springFast}
                    onClick={move}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold shadow-md shadow-blue-600/30 hover:bg-blue-700 transition"
                  >
                    🚗 Di chuyển
                  </motion.button>
                )}

                {canCare && (
                  <motion.button
                    whileHover={{ y: -2, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={springFast}
                    onClick={startCare}
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-extrabold shadow-md shadow-emerald-700/30 hover:bg-emerald-800 transition"
                  >
                    ✂️ Bắt đầu chăm
                  </motion.button>
                )}

                {canComplete && (
                  <motion.button
                    whileHover={{ y: -2, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={springFast}
                    onClick={complete}
                    className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-extrabold shadow-md hover:bg-black transition"
                  >
                    ✅ Hoàn thành đơn
                  </motion.button>
                )}

                {!canMove && !canCare && !canComplete && statusVN !== "Hoàn tất" && (
                  <div className="text-sm text-gray-600 font-semibold bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
                    Hiện chưa có hành động phù hợp cho trạng thái này.
                  </div>
                )}

                {statusVN === "Hoàn tất" && (
                  <div className="text-sm text-emerald-900 font-extrabold bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">
                    🎉 Đơn đã hoàn tất. Cảm ơn bạn!
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* tiny hint */}
        <AnimatePresence>
          {(canMove || canCare || canComplete) && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.25 }}
              className="text-xs font-semibold text-emerald-900 bg-white/80 border border-emerald-100 rounded-xl px-3 py-2 shadow-sm"
            >
              💡 Hãy thực hiện đúng thứ tự trạng thái để cập nhật tiến độ công việc.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ScrollToTopButton />
    </div>
  );
}

/* ---------- UI-only component ---------- */
function InfoCard({ icon, label, value, highlight }) {
  return (
    <div
      className={`p-4 rounded-2xl border shadow-sm transition hover:shadow-md ${
        highlight
          ? "bg-emerald-50 border-emerald-200"
          : "bg-white border-gray-100"
      }`}
    >
      <div className="text-xs font-extrabold text-gray-600 flex items-center gap-1">
        <span>{icon}</span> {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-gray-900">{value}</div>
    </div>
  );
}
