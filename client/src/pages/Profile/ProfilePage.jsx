// client/src/pages/Profile/ProfilePage.jsx
import { useEffect, useState } from "react";
import api from "../../api/api";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address: "",
  });

  const [pwForm, setPwForm] = useState({
    old_password: "",
    new_password: "",
  });

  const [msg, setMsg] = useState("");

  const load = async () => {
    const res = await api.get("/users/me");
    setUser(res.data);
    setForm({
      full_name: res.data.full_name || "",
      phone: res.data.phone || "",
      address: res.data.address || "",
    });
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const updateInfo = async (e) => {
    e.preventDefault();
    setMsg("");
    await api.put("/users/me", form);
    setMsg("✅ Cập nhật thông tin thành công");
    load();
    // sync localStorage name
    const stored = JSON.parse(localStorage.getItem("user") || "null");
    if (stored) {
      stored.full_name = form.full_name;
      stored.phone = form.phone;
      stored.address = form.address;
      localStorage.setItem("user", JSON.stringify(stored));
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setMsg("");
    await api.put("/users/me/password", pwForm);
    setMsg("✅ Đổi mật khẩu thành công");
    setPwForm({ old_password: "", new_password: "" });
  };

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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/70 to-emerald-100/80 p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white px-6 py-4 rounded-2xl shadow-lg border border-emerald-100 text-emerald-900 font-semibold flex items-center gap-2"
        >
          <span className="text-xl animate-pulse">👤</span>
          Đang tải thông tin...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/70 to-emerald-100/90 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
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
              👤
            </span>
            Thông tin cá nhân
          </motion.h1>

          <motion.div
            variants={fadeUp}
            className="text-sm font-semibold text-emerald-900 bg-white/80 border border-emerald-200 rounded-full px-3 py-1 shadow-sm"
          >
            Tài khoản:{" "}
            <span className="font-extrabold text-emerald-800">
              {user.full_name || user.email}
            </span>
          </motion.div>
        </motion.div>

        {/* Message toast */}
        <AnimatePresence mode="wait">
          {msg && (
            <motion.div
              key="msg"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="
                mb-2 p-3 bg-white rounded-2xl shadow-lg border border-emerald-100
                text-emerald-900 font-semibold flex items-center gap-2
              "
            >
              <span className="text-lg">✅</span>
              {msg}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* Thông tin */}
          <motion.form
            variants={fadeUp}
            onSubmit={updateInfo}
            className="
              bg-white p-6 rounded-2xl shadow-xl border border-emerald-100
              space-y-4 relative overflow-hidden
            "
          >
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-700 via-green-600 to-lime-500" />

            <h2 className="font-extrabold text-lg text-emerald-900 flex items-center gap-2">
              🪪 Thông tin tài khoản
            </h2>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg opacity-70">
                  📧
                </span>
                <input
                  value={user.email}
                  disabled
                  className="
                    border border-emerald-100 p-2.5 pl-10 rounded-xl w-full
                    bg-gray-100 text-gray-700 font-semibold
                  "
                />
              </div>
            </div>

            {/* Full name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                Họ tên
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg opacity-70">
                  👤
                </span>
                <input
                  className="
                    border border-emerald-200 p-2.5 pl-10 rounded-xl w-full
                    font-semibold text-emerald-900 placeholder:text-gray-400
                    focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400
                    transition
                  "
                  value={form.full_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, full_name: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                Số điện thoại
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg opacity-70">
                  📞
                </span>
                <input
                  className="
                    border border-emerald-200 p-2.5 pl-10 rounded-xl w-full
                    font-semibold text-emerald-900 placeholder:text-gray-400
                    focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400
                    transition
                  "
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                Địa chỉ
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg opacity-70">
                  📍
                </span>
                <input
                  className="
                    border border-emerald-200 p-2.5 pl-10 rounded-xl w-full
                    font-semibold text-emerald-900 placeholder:text-gray-400
                    focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400
                    transition
                  "
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                />
              </div>
            </div>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="
                w-full bg-emerald-700 text-white py-2.5 rounded-xl font-bold
                shadow-md shadow-emerald-700/30 hover:bg-emerald-800 hover:shadow-lg
                transition
              "
            >
              💾 Lưu thay đổi
            </motion.button>

            <div className="pointer-events-none absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-emerald-200/40 blur-3xl" />
          </motion.form>

          {/* Đổi mật khẩu */}
          <motion.form
            variants={fadeUp}
            onSubmit={changePassword}
            className="
              bg-white p-6 rounded-2xl shadow-xl border border-emerald-100
              space-y-4 relative overflow-hidden
            "
          >
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-500" />

            <h2 className="font-extrabold text-lg text-emerald-900 flex items-center gap-2">
              🔒 Đổi mật khẩu
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                Mật khẩu cũ
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg opacity-70">
                  🗝️
                </span>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu cũ"
                  className="
                    border border-emerald-200 p-2.5 pl-10 rounded-xl w-full
                    font-semibold text-emerald-900 placeholder:text-gray-400
                    focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400
                    transition
                  "
                  value={pwForm.old_password}
                  onChange={(e) =>
                    setPwForm((p) => ({ ...p, old_password: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                Mật khẩu mới
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg opacity-70">
                  🔐
                </span>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu mới"
                  className="
                    border border-emerald-200 p-2.5 pl-10 rounded-xl w-full
                    font-semibold text-emerald-900 placeholder:text-gray-400
                    focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400
                    transition
                  "
                  value={pwForm.new_password}
                  onChange={(e) =>
                    setPwForm((p) => ({ ...p, new_password: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="
                w-full bg-blue-700 text-white py-2.5 rounded-xl font-bold
                shadow-md shadow-blue-700/30 hover:bg-blue-800 hover:shadow-lg
                transition
              "
            >
              🔁 Đổi mật khẩu
            </motion.button>

            <div className="pointer-events-none absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-blue-200/40 blur-3xl" />
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}
