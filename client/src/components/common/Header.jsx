// client/src/components/common/Header.jsx
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Helps from "../ui/Helps";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [helpOpen, setHelpOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const renderMenu = () => {
    if (!user) return null;

    switch (user.role_id) {
      case 3:
        return (
          <nav className="hidden md:flex gap-5 text-sm font-semibold text-gray-700">
            <Link to="/customer/dashboard" className="hover:text-emerald-700 transition">
              Dashboard
            </Link>
            <Link to="/customer/my-plants" className="hover:text-emerald-700 transition">
              My Plants
            </Link>
            <Link to="/customer/orders" className="hover:text-emerald-700 transition">
              Order History
            </Link>
            <Link to="/customer/vouchers" className="hover:text-emerald-700 transition">
              Voucher
            </Link>
          </nav>
        );

      case 2:
        return (
          <nav className="hidden md:flex gap-5 text-sm font-semibold text-gray-700">
            <Link to="/staff/dashboard" className="hover:text-emerald-700 transition">
              Staff Dashboard
            </Link>
            <Link to="/staff/tasks" className="hover:text-emerald-700 transition">
              Tasks
            </Link>
            <Link to="/staff/history" className="hover:text-emerald-700 transition">
              Task History
            </Link>
          </nav>
        );

      case 1:
        return (
          <nav className="hidden md:flex gap-5 text-sm font-semibold text-gray-700">
            <Link to="/admin/dashboard" className="hover:text-emerald-700 transition">
              Admin Dashboard
            </Link>
            <Link to="/admin/users" className="hover:text-emerald-700 transition">
              Users
            </Link>
            <Link to="/admin/services" className="hover:text-emerald-700 transition">
              Services
            </Link>
            <Link to="/admin/orders" className="hover:text-emerald-700 transition">
              Orders
            </Link>
            <Link to="/admin/reports" className="hover:text-emerald-700 transition">
              Reports
            </Link>
          </nav>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-emerald-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 py-3 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-2 text-xl md:text-2xl font-extrabold tracking-tight text-emerald-700 hover:text-emerald-800 transition"
            >
              <span className="inline-flex h-9 w-9 rounded-xl bg-emerald-700 text-white items-center justify-center shadow-md shadow-emerald-700/30">
                🌿
              </span>
              PlantCare
            </Link>

            {renderMenu()}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 shadow-sm">
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setHelpOpen(true)}
                    title="Hướng dẫn sử dụng"
                    className="
                      w-8 h-8 flex items-center justify-center rounded-lg
                      bg-white border border-emerald-200 text-emerald-800 font-extrabold
                      shadow-sm hover:bg-emerald-100 transition
                    "
                  >
                    ?
                  </motion.button>

                  <span className="text-emerald-700 font-semibold text-sm">
                    Hi, {user.full_name || user.name}
                  </span>
                </div>

                <button
                  onClick={() => navigate("/profile")}
                  title="Thông tin cá nhân"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-emerald-100 shadow-sm hover:bg-emerald-50 transition"
                >
                  👤
                </button>

                <button
                  onClick={handleLogout}
                  className="
                    px-4 py-2 rounded-xl bg-emerald-700 text-white font-semibold
                    shadow-md shadow-emerald-700/25 hover:bg-emerald-800 hover:shadow-lg
                    active:scale-[0.98] transition-all duration-300
                  "
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="
                  px-4 py-2 rounded-xl bg-emerald-700 text-white font-semibold
                  shadow-md shadow-emerald-700/25 hover:bg-emerald-800 hover:shadow-lg
                  active:scale-[0.98] transition-all duration-300
                "
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ✅ Render Helps OUTSIDE header + không bọc motion.div để fixed hoạt động chuẩn */}
      <AnimatePresence>
        {helpOpen && (
          <Helps
            isOpen={helpOpen}
            onClose={() => setHelpOpen(false)}
            defaultRoleId={user?.role_id || 3}
          />
        )}
      </AnimatePresence>
    </>
  );
}
