// client/src/pages/Auth/RegisterPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role_id: 3, // mặc định customer
    phone: "",
    address: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Đăng ký thất bại.");
    }
  };

  // UI-only motion variants
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-emerald-50/70 to-emerald-100/90 px-4 py-8">
      {/* soft blobs */}
      <div className="pointer-events-none fixed -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-24 -right-24 h-72 w-72 rounded-full bg-green-200/40 blur-3xl" />

      <motion.div
        initial="hidden"
        animate="show"
        variants={stagger}
        className="
          relative w-full max-w-3xl bg-white/95 backdrop-blur
          p-7 md:p-8 rounded-3xl shadow-2xl border border-emerald-100
        "
      >
        {/* top gradient bar */}
        <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-3xl bg-gradient-to-r from-emerald-700 via-green-600 to-lime-500" />

        <motion.div variants={fadeUp} className="text-center mb-6 space-y-2">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md shadow-emerald-700/30 text-2xl">
            🪴
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-emerald-900">
            Tạo tài khoản
          </h2>
          <p className="text-sm text-gray-600 font-medium">
            Đăng ký để bắt đầu chăm sóc cây cùng PlantCare
          </p>
        </motion.div>

        {/* Error alert */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="register-error"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="
                mb-4 flex items-start gap-2 rounded-2xl border border-red-200
                bg-red-50 px-3 py-2 text-red-700 font-semibold text-sm
              "
            >
              <span className="text-lg leading-none">⚠️</span>
              <span className="leading-relaxed">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form
          variants={fadeUp}
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6"
        >
          {/* ================= LEFT COLUMN ================= */}
          <div className="space-y-4">
            {/* Full name */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-emerald-900 uppercase tracking-wide">
                Họ tên
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg opacity-70">
                  👤
                </span>
                <input
                  name="full_name"
                  placeholder="Nhập họ tên"
                  className="
                    w-full border border-emerald-200 rounded-xl p-2.5 pl-10
                    font-semibold text-emerald-900 placeholder:text-gray-400
                    focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400
                    transition
                  "
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-emerald-900 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg opacity-70">
                  📧
                </span>
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="
                    w-full border border-emerald-200 rounded-xl p-2.5 pl-10
                    font-semibold text-emerald-900 placeholder:text-gray-400
                    focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400
                    transition
                  "
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-emerald-900 uppercase tracking-wide">
                Mật khẩu
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg opacity-70">
                  🔒
                </span>
                <input
                  name="password"
                  type="password"
                  placeholder="Tạo mật khẩu"
                  className="
                    w-full border border-emerald-200 rounded-xl p-2.5 pl-10
                    font-semibold text-emerald-900 placeholder:text-gray-400
                    focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400
                    transition
                  "
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <div className="space-y-4 flex flex-col">
            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-emerald-900 uppercase tracking-wide">
                Số điện thoại
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg opacity-70">
                  📞
                </span>
                <input
                  name="phone"
                  type="text"
                  placeholder="Nhập số điện thoại"
                  className="
                    w-full border border-emerald-200 rounded-xl p-2.5 pl-10
                    font-semibold text-emerald-900 placeholder:text-gray-400
                    focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400
                    transition
                  "
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-emerald-900 uppercase tracking-wide">
                Địa chỉ
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg opacity-70">
                  📍
                </span>
                <input
                  name="address"
                  type="text"
                  placeholder="Nhập địa chỉ"
                  className="
                    w-full border border-emerald-200 rounded-xl p-2.5 pl-10
                    font-semibold text-emerald-900 placeholder:text-gray-400
                    focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400
                    transition
                  "
                  value={form.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-1.5 hidden">
              <label className="text-xs font-extrabold text-emerald-900 uppercase tracking-wide">
                Vai trò
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg opacity-70">
                  🎭
                </span>
                <select
                  name="role_id"
                  className="
                    w-full border border-emerald-200 rounded-xl p-2.5 pl-10
                    font-semibold text-emerald-900 bg-white
                    focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400
                    transition hidden
                  "
                  value={form.role_id}
                  onChange={handleChange}
                >
                  <option value={3}>Khách hàng</option>
                  <option value={2}>Nhân viên</option>
                  <option value={1}>Quản trị viên</option>
                </select>
              </div>
            </div>

            {/* Submit (đặt ở cuối cột phải) */}
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="
                mt-2 md:mt-auto bg-emerald-700 text-white py-2.5 rounded-xl font-extrabold
                shadow-md shadow-emerald-700/30 hover:bg-emerald-800 hover:shadow-lg
                transition w-full
              "
            >
              ✨ Đăng ký
            </motion.button>
          </div>
        </motion.form>

        <motion.p
          variants={fadeUp}
          className="text-center text-sm mt-6 text-gray-700 font-medium"
        >
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="text-emerald-700 font-extrabold hover:underline"
          >
            Đăng nhập
          </Link>
        </motion.p>

        {/* subtle bottom shine */}
        <div className="pointer-events-none absolute inset-x-8 bottom-3 h-10 bg-gradient-to-r from-emerald-100/0 via-emerald-100/70 to-emerald-100/0 blur-xl" />
      </motion.div>
    </div>
  );
}
