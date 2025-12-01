// client/src/pages/Admin/Reports.jsx
import { useEffect, useState } from "react";
import ScrollToTopButton from "../../components/ui/ScrollToTopButton";
import api from "../../api/api";
import { motion } from "framer-motion";

export default function Reports() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/admin/stats");
        setReport(res.data);
      } catch (err) {
        console.error("Failed to load report", err);
      }
    };
    fetch();
  }, []);

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/70 to-emerald-100/80 p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white px-6 py-4 rounded-2xl shadow-lg border border-emerald-100 text-emerald-900 font-semibold flex items-center gap-2"
        >
          <span className="text-xl animate-pulse">📊</span>
          Đang tải báo cáo...
        </motion.div>
      </div>
    );
  }

  // UI-only motion variants
  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
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

  const cards = [
    {
      icon: "🧾",
      label: "Tổng đơn hàng",
      value: report.orders,
      accent: "from-emerald-700 to-green-600",
    },
    {
      icon: "🧑‍🌾",
      label: "Nhân viên",
      value: report.staff,
      accent: "from-green-700 to-lime-600",
    },
    {
      icon: "👥",
      label: "Khách hàng",
      value: report.customers,
      accent: "from-emerald-800 to-teal-600",
    },
    {
      icon: "💰",
      label: "Doanh thu",
      value: `$${report.revenue}`,
      accent: "from-lime-600 to-emerald-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/70 to-emerald-100/90 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <motion.h1
            variants={fadeUp}
            className="text-2xl md:text-3xl font-extrabold text-emerald-900 flex items-center gap-2"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md shadow-emerald-700/30">
              📊
            </span>
            Báo cáo hệ thống
          </motion.h1>

          <motion.div
            variants={fadeUp}
            className="text-sm font-semibold text-emerald-900 bg-white/80 border border-emerald-200 rounded-full px-3 py-1 shadow-sm"
          >
            Cập nhật theo dữ liệu thanh toán
          </motion.div>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
        >
          {cards.map((c, idx) => (
            <motion.div
              key={idx}
              variants={fadeUp}
              whileHover={{ y: -6, scale: 1.02 }}
              className="
                bg-white rounded-2xl border border-emerald-100
                shadow-lg hover:shadow-2xl transition-all duration-300
                p-4 relative overflow-hidden
              "
            >
              {/* accent bar */}
              <div
                className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${c.accent}`}
              />

              <div className="flex items-center gap-3">
                <div
                  className="
                    h-12 w-12 rounded-2xl flex items-center justify-center
                    bg-emerald-50 text-2xl shadow-inner border border-emerald-100
                  "
                >
                  {c.icon}
                </div>
                <div>
                  <p className="text-xs font-extrabold text-emerald-900 uppercase tracking-wide">
                    {c.label}
                  </p>
                  <p className="text-2xl font-extrabold text-gray-900 mt-1">
                    {c.value}
                  </p>
                </div>
              </div>

              {/* subtle glow */}
              <div className="pointer-events-none absolute -right-10 -bottom-10 h-28 w-28 rounded-full bg-emerald-200/40 blur-2xl" />
            </motion.div>
          ))}
        </motion.div>

        {/* Notes */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="
            bg-white p-5 rounded-2xl shadow-lg border border-emerald-100
            space-y-2
          "
        >
          <h2 className="font-extrabold text-emerald-900 flex items-center gap-2">
            <span className="text-lg">📝</span>
            Ghi chú
          </h2>

          <p className="text-sm text-gray-700 leading-relaxed">
            Báo cáo cơ bản: tổng đơn, số nhân viên, khách hàng và tổng doanh thu
            (được tổng hợp từ payments có status = paid).
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-100 text-xs font-bold">
              ✅ Doanh thu xác nhận
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-100 text-xs font-bold">
              🔄 Tự động cập nhật
            </span>
          </div>
        </motion.section>

        <ScrollToTopButton />
      </div>
    </div>
  );
}
