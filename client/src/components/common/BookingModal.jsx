// client/src/components/common/BookingModal.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { motion, AnimatePresence } from "framer-motion";

export default function BookingModal({
  isOpen,
  onClose,
  services: initialServices,
  singleService,
  onBooked,
}) {
  const navigate = useNavigate();
  const [services, setServices] = useState(initialServices || []);
  const [selected, setSelected] = useState(() =>
    singleService ? [{ ...singleService, qty: 1 }] : []
  );

  const [plants, setPlants] = useState([]);
  const [vouchers, setVouchers] = useState([]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: "",
    address: "",
    note: "",
    voucher_code: "",
    plant_id: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initialServices && !singleService) {
      api
        .get("/services")
        .then((res) => setServices(res.data.services || []))
        .catch(() => setServices([]));
    } else if (initialServices) setServices(initialServices);
  }, [initialServices, singleService, isOpen]);

  useEffect(() => {
    if (singleService) setSelected([{ ...singleService, qty: 1 }]);
    else setSelected([]);
  }, [singleService, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) return;
    api
      .get(`/customers/${user.id}/plants`)
      .then((r) => setPlants(Array.isArray(r.data) ? r.data : []))
      .catch(() => setPlants([]));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const token = localStorage.getItem("token");
    if (!token) return setVouchers([]);
    api
      .get("/vouchers/me")
      .then((res) => setVouchers(Array.isArray(res.data) ? res.data : []))
      .catch(() => setVouchers([]));
  }, [isOpen]);

  // ✅ UI change: chỉ cho chọn 1 dịch vụ, qty luôn = 1
  const toggleService = (s) => {
    if (singleService) return;
    setSelected([{ ...s, qty: 1 }]); // luôn giữ 1 item duy nhất
  };

  // giữ lại hàm để không ảnh hưởng logic cũ (UI không dùng nữa)
  const changeQty = (id, delta) => {
    setSelected((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, qty: Math.max(1, p.qty + delta) } : p
      )
    );
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ NEW: nếu chưa có cây thì điều hướng qua Dashboard để thêm cây
  const handleGoAddPlant = () => {
    const ok = window.confirm(
      "Bạn chưa có cây nào. Chuyển đến Dashboard để thêm cây ngay?"
    );
    if (!ok) return;
    onClose();
    navigate("/customer/dashboard", {
      state: { openAddPlantModal: true },
    });
  };

  const handleBook = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      onClose();
      navigate("/login");
      return;
    }

    if (selected.length === 0) {
      alert("Vui lòng chọn ít nhất 1 dịch vụ.");
      return;
    }
    if (!form.name || !form.date || !form.address) {
      alert("Vui lòng điền tên, ngày và địa chỉ.");
      return;
    }

    const noteFinal =
      form.note?.trim() ||
      `Đặt qua web - ${
        singleService ? `service:${singleService.name}` : "Plant Care"
      }`;

    setLoading(true);
    try {
      const payloadServices = selected.map((s) => ({
        service_id: s.id,
        quantity: 1, // ✅ ép luôn =1 (UI-only)
        price: s.price,
      }));

      await api.post("/orders", {
        services: payloadServices,
        scheduled_date: form.date,
        address: form.address,
        note: noteFinal,
        plant_id: form.plant_id || null,
        voucher_code: form.voucher_code || null,
        phone: form.phone?.trim() || null,
        customer_name: form.name.trim(),
      });

      onBooked && onBooked();
      onClose();
      alert("Đặt lịch thành công!");
    } catch (err) {
      console.error("booking failed", err);
      alert(err.response?.data?.message || "Đặt lịch thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  const list = singleService ? [singleService] : services;

  // UI-only motion variants
  const overlayVar = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.18 } },
  };

  const modalVar = {
    hidden: { opacity: 0, y: 18, scale: 0.97 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 420, damping: 30 },
    },
    exit: {
      opacity: 0,
      y: 18,
      scale: 0.97,
      transition: { duration: 0.18 },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  };

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
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
              relative z-10 w-full max-w-3xl
              rounded-3xl bg-white shadow-2xl shadow-emerald-900/20
              border border-emerald-100 overflow-hidden
            "
          >
            {/* top gradient line */}
            <div className="h-1.5 bg-gradient-to-r from-emerald-700 via-green-500 to-lime-400" />

            <div className="p-6 md:p-7">
              {/* Header */}
              <motion.div
                initial="hidden"
                animate="show"
                variants={stagger}
                className="flex justify-between items-center mb-5"
              >
                <motion.h3
                  variants={fadeUp}
                  className="text-xl md:text-2xl font-extrabold text-emerald-900 flex items-center gap-2"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-md shadow-emerald-700/30">
                    🌿
                  </span>
                  Đặt lịch chăm sóc cây
                </motion.h3>

                <motion.button
                  variants={fadeUp}
                  onClick={onClose}
                  className="
                    h-9 w-9 inline-flex items-center justify-center rounded-xl
                    bg-emerald-50 text-emerald-900 border border-emerald-100
                    hover:bg-emerald-100 active:scale-95 transition
                  "
                  aria-label="Close"
                >
                  ✕
                </motion.button>
              </motion.div>

              {/* Body grid */}
              <div className="grid md:grid-cols-2 gap-5 items-start">
                {/* LEFT: services */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-extrabold text-emerald-900 flex items-center gap-2">
                      🛠️ Chọn dịch vụ
                    </h4>
                    <div className="text-xs font-semibold text-gray-600">
                      Đã chọn:{" "}
                      <span className="font-extrabold text-emerald-900">
                        {selected.length}
                      </span>
                    </div>
                  </div>

                  <div
                    className="
                      space-y-2 max-h-[420px] overflow-auto pr-2
                      border border-emerald-100 rounded-2xl p-2 bg-emerald-50/30
                      scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-transparent
                    "
                  >
                    <AnimatePresence initial={false}>
                      {list.map((s) => {
                        const picked = selected.find((x) => x.id === s.id);

                        return (
                          <motion.button
                            type="button"
                            key={s.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            whileHover={{ y: -2 }}
                            onClick={() => toggleService(s)}
                            className={`
                              w-full text-left
                              flex items-center justify-between gap-3
                              border rounded-2xl p-3 bg-white
                              shadow-sm hover:shadow-md transition-all duration-200
                              ${picked
                                ? "border-emerald-400 ring-2 ring-emerald-200 bg-emerald-50/60"
                                : "border-emerald-100 hover:bg-emerald-50/40"
                              }
                            `}
                          >
                            <div className="min-w-0">
                              <div className="font-bold text-gray-900 flex items-center gap-2">
                                <span
                                  className={`
                                    inline-flex h-7 w-7 items-center justify-center rounded-lg text-sm
                                    ${picked ? "bg-emerald-700 text-white" : "bg-emerald-100 text-emerald-900"}
                                  `}
                                >
                                  🧺
                                </span>
                                <span className="line-clamp-1">{s.name}</span>
                              </div>

                              <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {s.description?.slice(0, 90)}
                              </div>

                              <div className="text-sm font-extrabold text-emerald-800 mt-1">
                                ${s.price}{" "}
                                <span className="text-gray-500 font-semibold">
                                  • {s.duration_minutes} phút
                                </span>
                              </div>
                            </div>

                            {/* ✅ Badge chọn */}
                            {picked && (
                              <div
                                className="
                                  shrink-0 px-2.5 py-1 rounded-full
                                  text-xs font-extrabold
                                  bg-emerald-700 text-white shadow-sm
                                "
                              >
                                Đã chọn
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>

                {/* RIGHT: form */}
                <form onSubmit={handleBook} className="space-y-3 flex flex-col">
                  <h4 className="font-extrabold text-emerald-900 flex items-center gap-2">
                    👤 Thông tin khách hàng
                  </h4>

                  <Field
                    icon="🧑‍🌾"
                    name="name"
                    placeholder="Họ tên"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />

                  <Field
                    icon="📞"
                    name="phone"
                    placeholder="Số điện thoại (có thể để trống)"
                    value={form.phone}
                    onChange={handleChange}
                  />

                  <Field
                    icon="📍"
                    name="address"
                    placeholder="Địa chỉ"
                    value={form.address}
                    onChange={handleChange}
                    required
                  />

                  <div className="relative">
                    <div className="absolute left-3 top-3 text-emerald-700">📝</div>
                    <textarea
                      name="note"
                      placeholder="Ghi chú (tuỳ chọn)"
                      className="
                        w-full h-20 pl-10 pr-3 py-2.5 rounded-xl
                        border border-emerald-100 bg-white
                        text-sm text-gray-900 font-medium
                        placeholder:text-gray-400
                        focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400
                        transition
                      "
                      value={form.note}
                      onChange={handleChange}
                    />
                  </div>

                  <SelectField
                    icon="🎟️"
                    name="voucher_code"
                    value={form.voucher_code}
                    onChange={handleChange}
                    className="bg-white"
                  >
                    <option value="">Chọn mã giảm giá (nếu có)</option>
                    {vouchers
                      .filter((v) => !v.is_used)
                      .map((v) => (
                        <option key={v.code} value={v.code}>
                          {v.code} — Giảm {v.discount_percent}% — HSD{" "}
                          {new Date(v.expires_at).toLocaleDateString()}
                        </option>
                      ))}
                  </SelectField>

                  {/* ✅ Plant select with smart redirect */}
                  <div className="space-y-1">
                    <SelectField
                      icon="🌱"
                      name="plant_id"
                      value={form.plant_id}
                      onChange={handleChange}
                      onMouseDown={(e) => {
                        if (plants.length === 0) {
                          e.preventDefault();
                          handleGoAddPlant();
                        }
                      }}
                    >
                      <option value="">Chọn cây cần chăm</option>
                      {plants.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.type || "—"})
                        </option>
                      ))}
                    </SelectField>

                    {plants.length === 0 && (
                      <button
                        type="button"
                        onClick={handleGoAddPlant}
                        className="
                          text-xs font-bold text-emerald-800 no-underline
                          hover:text-emerald-900 transition
                          inline-flex items-center gap-1
                        "
                      >
                        ➕ Bạn chưa có cây nào, bấm để thêm cây ngay
                      </button>
                    )}
                  </div>

                  <label className="block">
                    <div className="text-sm mb-1 font-semibold text-gray-700 flex items-center gap-1">
                      📅 Chọn ngày
                    </div>
                    <input
                      name="date"
                      type="datetime-local"
                      className="
                        w-full px-3 py-2.5 rounded-xl
                        border border-emerald-100 bg-white
                        text-sm text-gray-900 font-medium
                        focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400
                        transition
                      "
                      value={form.date}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  {/* Actions */}
                  <div className="mt-auto flex justify-end gap-2 pt-2">
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
                        <>✅ Đặt lịch</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ---------- UI-only components ---------- */

function Field({ icon, className = "", ...props }) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700">
        {icon}
      </div>
      <input
        {...props}
        className={`
          w-full pl-10 pr-3 py-2.5 rounded-xl
          border border-emerald-100 bg-white
          text-sm text-gray-900 font-medium
          placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400
          transition
          ${className}
        `}
      />
    </div>
  );
}

function SelectField({ icon, className = "", children, ...props }) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700">
        {icon}
      </div>
      <select
        {...props}
        className={`
          w-full pl-10 pr-3 py-2.5 rounded-xl
          border border-emerald-100 bg-white
          text-sm text-gray-900 font-medium
          focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400
          transition
          ${className}
        `}
      >
        {children}
      </select>
    </div>
  );
}
