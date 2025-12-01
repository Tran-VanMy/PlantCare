// client/src/components/common/AddPlantModal.jsx
import { useState } from "react";
import api from "../../api/api";
import { motion, AnimatePresence } from "framer-motion";

export default function AddPlantModal({ isOpen, onClose, onAdded }) {
  const [form, setForm] = useState({
    name: "",
    type: "",
    location: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // POST /api/plants => server sẽ dùng token để gắn owner
      await api.post("/plants", form);
      onAdded && onAdded();
      onClose();
    } catch (err) {
      console.error("Failed add plant", err);
      alert(err.response?.data?.message || "Thêm cây thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Motion variants (UI only)
  const overlayVar = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.18 } }
  };

  const modalVar = {
    hidden: { opacity: 0, y: 18, scale: 0.97 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 420, damping: 30 }
    },
    exit: {
      opacity: 0,
      y: 18,
      scale: 0.97,
      transition: { duration: 0.18 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            variants={overlayVar}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
          />

          {/* Modal */}
          <motion.div
            variants={modalVar}
            initial="hidden"
            animate="show"
            exit="exit"
            className="
              relative z-10 w-full max-w-md
              rounded-2xl bg-white shadow-2xl shadow-emerald-900/20
              border border-emerald-100 overflow-hidden
            "
          >
            {/* Top gradient bar */}
            <div className="h-1.5 bg-gradient-to-r from-emerald-700 via-green-500 to-lime-400" />

            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-md shadow-emerald-700/30">
                    🌿
                  </span>
                  <h3 className="text-xl font-extrabold text-emerald-900">
                    Thêm cây mới
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="
                    h-9 w-9 inline-flex items-center justify-center rounded-xl
                    bg-emerald-50 text-emerald-900 border border-emerald-100
                    hover:bg-emerald-100 active:scale-95 transition
                  "
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <Field
                  icon="🪴"
                  name="name"
                  placeholder="Tên cây"
                  required
                  value={form.name}
                  onChange={handleChange}
                />
                <Field
                  icon="🏷️"
                  name="type"
                  placeholder="Loại"
                  value={form.type}
                  onChange={handleChange}
                />
                <Field
                  icon="📍"
                  name="location"
                  placeholder="Vị trí"
                  value={form.location}
                  onChange={handleChange}
                />

                <div className="relative">
                  <div className="absolute left-3 top-3 text-emerald-700">📝</div>
                  <textarea
                    name="description"
                    placeholder="Mô tả"
                    value={form.description}
                    onChange={handleChange}
                    className="
                      w-full min-h-[110px] pl-10 pr-3 py-2.5 rounded-xl
                      border border-emerald-100 bg-white
                      text-sm text-gray-900 font-medium
                      placeholder:text-gray-400
                      focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400
                      transition
                    "
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="
                      px-4 py-2 rounded-xl font-semibold text-gray-800
                      bg-gray-100 border border-gray-200
                      hover:bg-gray-200 active:scale-[0.98]
                      transition
                    "
                  >
                    Hủy
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      px-5 py-2 rounded-xl font-extrabold text-white
                      bg-emerald-700 shadow-md shadow-emerald-700/30
                      hover:bg-emerald-800 hover:shadow-lg
                      active:scale-[0.98]
                      disabled:opacity-60 disabled:cursor-not-allowed
                      transition-all duration-200
                      inline-flex items-center gap-2
                    "
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        ➕ Thêm cây
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ---------- UI-only Input Field ---------- */
function Field({ icon, ...props }) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700">
        {icon}
      </div>
      <input
        {...props}
        className="
          w-full pl-10 pr-3 py-2.5 rounded-xl
          border border-emerald-100 bg-white
          text-sm text-gray-900 font-medium
          placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400
          transition
        "
      />
    </div>
  );
}
