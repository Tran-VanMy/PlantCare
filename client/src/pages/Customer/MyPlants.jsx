// client/src/pages/Customer/MyPlants.jsx
import { useEffect, useState } from "react";
import api from "../../api/api";
import Modal from "../../components/ui/Modal";
import ScrollToTopButton from "../../components/ui/ScrollToTopButton";
import { motion, AnimatePresence } from "framer-motion";

export default function MyPlants() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlant, setSelectedPlant] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) return;

    const fetchPlants = async () => {
      try {
        const res = await api.get(`/customers/${storedUser.id}/plants`);
        setPlants(res.data);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách cây:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

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

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-emerald-100/60 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-56 bg-emerald-100 rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-52 bg-white rounded-2xl border border-emerald-100 shadow-sm"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );

  if (plants.length === 0)
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-emerald-100/60 p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white rounded-2xl border border-emerald-100 shadow-lg shadow-emerald-900/5 p-8 text-center max-w-md"
        >
          <div className="text-5xl mb-3">🪴</div>
          <h2 className="text-xl font-extrabold text-emerald-900">
            Bạn chưa có cây nào
          </h2>
          <p className="text-gray-700 mt-2 text-sm font-medium">
            Hãy thêm cây để bắt đầu theo dõi và chăm sóc cùng PlantCare nhé!
          </p>
        </motion.div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-emerald-100/70 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="mb-6 flex items-center justify-between flex-wrap gap-3"
        >
          <motion.h1
            variants={fadeUp}
            className="text-2xl md:text-3xl font-extrabold text-emerald-900 flex items-center gap-2"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-md shadow-emerald-700/30">
              🌱
            </span>
            Cây của bạn
          </motion.h1>

          <motion.div
            variants={fadeUp}
            className="text-sm font-semibold text-gray-700"
          >
            Tổng cộng:{" "}
            <span className="text-emerald-900 font-extrabold">
              {plants.length}
            </span>{" "}
            cây
          </motion.div>
        </motion.div>

        {/* Grid plants */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5"
        >
          {plants.map((plant) => (
            <motion.div
              key={plant.id}
              variants={fadeUp}
              // ✅ Hover spring nhanh, mượt, không delay/giật
              whileHover={{ y: -6, scale: 1.015 }}
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 28,
                mass: 0.6,
              }}
              // ✅ GPU + will-change giúp render mượt
              style={{ willChange: "transform" }}
              className="
                bg-white p-5 rounded-3xl
                border border-emerald-100
                shadow-md shadow-emerald-900/5
                hover:shadow-xl hover:shadow-emerald-900/10
                transition-shadow duration-200
                flex flex-col relative overflow-hidden
                transform-gpu
              "
            >
              {/* subtle top gradient */}
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-700 via-green-500 to-lime-400" />

              {/* Card header */}
              <div className="flex items-start justify-between gap-2 mt-1">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md shadow-emerald-700/30">
                    🪴
                  </span>
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900 line-clamp-1">
                      {plant.name}
                    </h3>
                    <p className="text-xs font-semibold text-emerald-700">
                      {plant.type || "Chưa rõ loại"}
                    </p>
                  </div>
                </div>

                {/* created date pill */}
                <div className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-100 whitespace-nowrap">
                  {new Date(plant.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Body */}
              <div className="mt-4 space-y-2 text-sm text-gray-700 font-medium">
                <p className="line-clamp-1 flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                    📍
                  </span>
                  Vị trí: {plant.location || "—"}
                </p>

                <p className="line-clamp-2 flex items-start gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100 mt-[2px]">
                    📝
                  </span>
                  <span>Mô tả: {plant.description || "—"}</span>
                </p>
              </div>

              {/* CTA */}
              <button
                onClick={() => setSelectedPlant(plant)}
                className="
                  mt-5 w-full
                  bg-emerald-700 text-white py-2.5 rounded-xl font-semibold
                  shadow-md shadow-emerald-700/25
                  hover:bg-emerald-800 hover:shadow-lg
                  active:scale-[0.98]
                  transition-all duration-200
                  flex items-center justify-center gap-2
                "
              >
                Xem chi tiết
                <span className="text-lg">→</span>
              </button>

              {/* corner leaf (animated, UI only) */}
              <motion.div
                initial={{ opacity: 0.12, scale: 0.95 }}
                animate={{ opacity: 0.28, scale: 1 }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  repeatType: "mirror",
                }}
                className="absolute -right-5 -bottom-6 text-7xl text-emerald-900/10 select-none pointer-events-none"
              >
                🌿
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Modal detail (enhanced UI) */}
        <Modal
          isOpen={!!selectedPlant}
          onClose={() => setSelectedPlant(null)}
          title={`Chi tiết cây`}
        >
          <AnimatePresence mode="wait">
            {selectedPlant && (
              <motion.div
                key={selectedPlant.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="space-y-4 text-sm"
              >
                {/* Top summary */}
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-sm">
                      🪴
                    </span>
                    <div>
                      <div className="text-base font-extrabold text-emerald-900">
                        {selectedPlant.name}
                      </div>
                      <div className="text-xs font-semibold text-gray-600">
                        {selectedPlant.type || "Chưa rõ loại"}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] font-bold text-gray-600">
                      Ngày thêm
                    </div>
                    <div className="text-xs font-semibold text-emerald-900">
                      {new Date(selectedPlant.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoCard
                    icon="🏷️"
                    label="Loại cây"
                    value={selectedPlant.type || "—"}
                  />
                  <InfoCard
                    icon="📍"
                    label="Vị trí"
                    value={selectedPlant.location || "—"}
                  />
                </div>

                {/* Description */}
                <div className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
                  <div className="text-xs font-bold text-gray-600 flex items-center gap-1">
                    📝 Mô tả
                  </div>
                  <div className="mt-1 font-semibold text-gray-900 whitespace-pre-wrap">
                    {selectedPlant.description || "—"}
                  </div>
                </div>

                {/* Hint UI only */}
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900 text-xs font-semibold">
                  ✨ Bạn có thể đặt dịch vụ chăm sóc cho cây này ngay trong PlantCare.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Modal>
      </div>

      <ScrollToTopButton />
    </div>
  );
}

/* ---------- UI-only component ---------- */
function InfoCard({ icon, label, value }) {
  return (
    <div className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition">
      <div className="text-xs font-bold text-gray-600 flex items-center gap-1">
        <span>{icon}</span> {label}
      </div>
      <div className="mt-1 font-semibold text-gray-900">{value}</div>
    </div>
  );
}
