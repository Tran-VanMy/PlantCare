// client/src/pages/Customer/Vouchers.jsx
import { useEffect, useMemo, useState } from "react";
import ScrollToTopButton from "../../components/ui/ScrollToTopButton";
import api from "../../api/api";
import { motion, AnimatePresence } from "framer-motion";

export default function Vouchers() {
  const [vouchers, setVouchers] = useState([]);

  useEffect(() => {
    api.get("/vouchers/me")
      .then((res) => setVouchers(Array.isArray(res.data) ? res.data : []))
      .catch(console.error);
  }, []);

  // UI-only: motion variants
  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };

  // UI-only
  const sortedVouchers = useMemo(() => {
    return [...vouchers].sort((a, b) => {
      const da = new Date(a.expires_at || 0).getTime();
      const db = new Date(b.expires_at || 0).getTime();
      return da - db;
    });
  }, [vouchers]);

  return (
    <div
      className="
        min-h-screen p-6
        bg-gradient-to-b from-white via-emerald-50/40 to-emerald-100/70
        relative isolate
        !opacity-100
        z-[9999]
      "
    >
      {/* z-[9999] + !opacity-100 để luôn nổi trên overlay ngoài layout */}
      <div className="max-w-7xl mx-auto relative z-[9999] !opacity-100">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="mb-6 flex items-center justify-between gap-3 flex-wrap relative z-[9999] !opacity-100"
        >
          <motion.h1
            variants={fadeUp}
            className="text-2xl md:text-3xl font-extrabold text-emerald-900 flex items-center gap-2"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-md shadow-emerald-700/30">
              🎟️
            </span>
            Voucher của tôi
          </motion.h1>

          <motion.div
            variants={fadeUp}
            className="text-sm font-semibold text-gray-700"
          >
            Bạn có{" "}
            <span className="font-extrabold text-emerald-900">
              {vouchers.length}
            </span>{" "}
            voucher
          </motion.div>
        </motion.div>

        {/* Content */}
        {vouchers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="
              bg-white rounded-2xl border border-emerald-100 shadow-md p-8 text-center
              relative z-[9999] !opacity-100
            "
          >
            <div className="text-5xl mb-3">🎁</div>
            <h2 className="text-lg font-extrabold text-emerald-900">
              Bạn chưa có voucher nào
            </h2>
            <p className="text-gray-700 text-sm mt-1 font-medium">
              Hãy đặt dịch vụ để nhận thêm ưu đãi nhé!
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="
              grid md:grid-cols-2 gap-5
              relative z-[9999] !opacity-100
            "
          >
            <AnimatePresence initial={false}>
              {sortedVouchers.map((v) => {
                const isExpired =
                  v.expires_at && new Date(v.expires_at).getTime() < Date.now();

                return (
                  <motion.div
                    key={v.code}
                    variants={fadeUp}
                    whileHover={{ y: -6, scale: 1.01 }}
                    transition={{ duration: 0.25 }}
                    className={`
                      relative isolate z-[9999] !opacity-100
                      overflow-hidden rounded-2xl border shadow-md bg-white
                      ${isExpired ? "border-gray-200 opacity-70" : "border-emerald-100"}
                    `}
                  >
                    {/* Decorative gradient strip */}
                    <div
                      className={`
                        absolute inset-x-0 top-0 h-1.5
                        ${isExpired
                          ? "bg-gray-300"
                          : "bg-gradient-to-r from-emerald-600 via-green-500 to-lime-400"}
                      `}
                    />

                    <div className="p-5 relative z-[9999] !opacity-100">
                      {/* Code + badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-gray-600">
                            MÃ ƯU ĐÃI
                          </div>
                          <div className="font-extrabold text-xl tracking-wide text-emerald-900">
                            {v.code}
                          </div>
                        </div>

                        <span
                          className={`
                            inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border
                            ${
                              v.is_used
                                ? "bg-gray-100 text-gray-700 border-gray-200"
                                : isExpired
                                ? "bg-rose-50 text-rose-800 border-rose-200"
                                : "bg-emerald-50 text-emerald-800 border-emerald-200"
                            }
                          `}
                        >
                          {v.is_used
                            ? "Đã dùng"
                            : isExpired
                            ? "Hết hạn"
                            : "Chưa dùng"}
                        </span>
                      </div>

                      {/* Discount */}
                      <div className="mt-4 flex items-center gap-3">
                        <div
                          className={`
                            h-12 w-12 rounded-xl flex items-center justify-center text-white text-xl shadow
                            ${isExpired
                              ? "bg-gray-400"
                              : "bg-emerald-700 shadow-emerald-700/30"}
                          `}
                        >
                          %
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-600">
                            GIẢM GIÁ
                          </div>
                          <div className="text-2xl font-extrabold text-emerald-800">
                            {v.discount_percent}%
                          </div>
                        </div>
                      </div>

                      {/* Expire */}
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                          <div className="text-xs font-bold text-gray-600 flex items-center gap-1">
                            ⏰ Hết hạn
                          </div>
                          <div className="mt-1 font-semibold text-gray-900">
                            {v.expires_at
                              ? new Date(v.expires_at).toLocaleString()
                              : "—"}
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
                          <div className="text-xs font-bold text-gray-600 flex items-center gap-1">
                            📌 Trạng thái
                          </div>
                          <div className="mt-1 font-semibold text-gray-900">
                            {v.is_used ? "Đã dùng" : "Chưa dùng"}
                          </div>
                        </div>
                      </div>

                      {/* Hint */}
                      {!v.is_used && !isExpired && (
                        <div className="mt-4 text-xs font-semibold text-emerald-900 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                          ✨ Dùng voucher này khi thanh toán để được giảm giá!
                        </div>
                      )}
                    </div>

                    {/* Corner icon (subtle animation) */}
                    {!v.is_used && !isExpired && (
                      <motion.div
                        initial={{ opacity: 0.35, scale: 0.9 }}
                        animate={{ opacity: 0.9, scale: 1 }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          repeatType: "mirror",
                        }}
                        className="
                          absolute -right-4 -bottom-4 text-7xl opacity-10 select-none pointer-events-none
                          z-0
                        "
                      >
                        🌿
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        <ScrollToTopButton />
      </div>
    </div>
  );
}
