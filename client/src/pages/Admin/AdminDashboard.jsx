// client/src/pages/Admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ScrollToTopButton from "../../components/ui/ScrollToTopButton";
import api from "../../api/api";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
    };
    fetchStats();
  }, []);

  // motion variants (UI only)
  const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: "easeOut" },
    },
  };

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };

  const springFast = { type: "spring", stiffness: 520, damping: 28, mass: 0.7 };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/50 to-emerald-100/80 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.header
          initial="hidden"
          animate="show"
          variants={stagger}
          className="flex justify-between items-center flex-wrap gap-3"
        >
          <motion.h1
            variants={fadeUp}
            className="text-2xl md:text-3xl font-extrabold text-emerald-900 flex items-center gap-2"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md shadow-emerald-700/30">
              🛡️
            </span>
            Bảng điều khiển quản trị
          </motion.h1>

          <motion.div
            variants={fadeUp}
            className="text-sm font-semibold text-emerald-900/90 bg-white/80 border border-emerald-200 rounded-full px-3 py-1 shadow-sm"
          >
            🌿 PlantCare Admin
          </motion.div>
        </motion.header>

        {/* Stats */}
        <AnimatePresence mode="wait">
          {!stats ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="bg-white rounded-3xl border border-emerald-100 shadow-lg p-6"
            >
              <div className="animate-pulse space-y-4">
                <div className="h-5 w-36 bg-emerald-100 rounded" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-24 rounded-2xl bg-emerald-50 border border-emerald-100"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.section
              key="stats"
              initial="hidden"
              animate="show"
              variants={stagger}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <StatCard
                icon="🧾"
                label="Tổng đơn hàng"
                value={stats.orders}
                tone="emerald"
              />
              <StatCard
                icon="🧑‍🔧"
                label="Nhân viên"
                value={stats.staff}
                tone="blue"
              />
              <StatCard
                icon="👥"
                label="Khách hàng"
                value={stats.customers}
                tone="amber"
              />
              <StatCard
                icon="💰"
                label="Doanh thu tháng"
                value={`$${stats.revenue}`}
                tone="green"
              />
            </motion.section>
          )}
        </AnimatePresence>

        {/* System management */}
        <motion.section
          initial="hidden"
          animate="show"
          variants={stagger}
          className="bg-white rounded-3xl border border-emerald-100 shadow-xl p-6 md:p-7"
        >
          <motion.div variants={fadeUp} className="flex items-end justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm">
                  ⚙️
                </span>
                Quản lý hệ thống
              </h2>
              <p className="text-gray-700 text-sm font-medium mt-1">
                Điều hướng nhanh đến các khu vực quản trị quan trọng.
              </p>
            </div>

            <div className="text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Quick Actions
            </div>
          </motion.div>

          <motion.div
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <AdminLink label="Người dùng" icon="👤" to="/admin/users" />
            <AdminLink label="Dịch vụ" icon="🌿" to="/admin/services" />
            <AdminLink label="Đơn hàng" icon="🧾" to="/admin/orders" />
            <AdminLink label="Báo cáo" icon="📊" to="/admin/reports" />
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-5 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-emerald-900 text-xs font-semibold"
          >
            ✨ Mẹo: Bạn có thể theo dõi doanh thu & hiệu suất hệ thống trong mục Báo cáo.
          </motion.div>
        </motion.section>
      </div>

      <ScrollToTopButton />
    </div>
  );
}

/* ---------- UI-only components ---------- */

function StatCard({ icon, label, value, tone = "emerald" }) {
  const tones = {
    emerald: "from-emerald-600 to-green-500 shadow-emerald-700/25",
    green: "from-green-600 to-lime-500 shadow-green-700/25",
    blue: "from-blue-600 to-sky-500 shadow-blue-700/25",
    amber: "from-amber-500 to-orange-400 shadow-amber-700/25",
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
      }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 520, damping: 28 }}
      className="relative overflow-hidden bg-white rounded-3xl border border-emerald-100 shadow-md hover:shadow-xl transition-shadow"
    >
      {/* top gradient bar */}
      <div className={`h-1.5 bg-gradient-to-r ${tones[tone]}`} />

      <div className="p-4 flex items-center gap-3">
        <div
          className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${tones[tone]} text-white flex items-center justify-center text-2xl shadow-md`}
        >
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-600 line-clamp-1">
            {label}
          </p>
          <p className="text-2xl font-extrabold text-gray-900 mt-0.5">
            {value}
          </p>
        </div>
      </div>

      {/* subtle corner decoration */}
      <div className="absolute -right-6 -bottom-7 text-7xl text-emerald-900/5 select-none pointer-events-none">
        🌿
      </div>
    </motion.div>
  );
}

function AdminLink({ label, icon, to }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
      }}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 520, damping: 28 }}
    >
      <Link
        to={to}
        className="
          group relative block h-full
          bg-white rounded-2xl border border-emerald-100
          shadow-sm hover:shadow-xl transition-all duration-300
          p-5 text-center overflow-hidden
        "
      >
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-700 via-green-500 to-lime-400 opacity-0 group-hover:opacity-100 transition" />

        <div className="flex flex-col items-center gap-2">
          <div className="text-3xl">{icon}</div>
          <div className="font-extrabold text-gray-900 group-hover:text-emerald-800 transition">
            {label}
          </div>
          <div className="text-xs text-gray-600 font-semibold">
            Xem & quản lý
          </div>
        </div>

        <div className="absolute -right-6 -bottom-7 text-7xl text-emerald-900/5 select-none pointer-events-none">
          ⚙️
        </div>
      </Link>
    </motion.div>
  );
}
