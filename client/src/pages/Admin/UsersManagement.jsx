// client/src/pages/Admin/UsersManagement.jsx
import { useEffect, useMemo, useState } from "react";
import ScrollToTopButton from "../../components/ui/ScrollToTopButton";
import api from "../../api/api";
import { motion, AnimatePresence } from "framer-motion";

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [sortBy, setSortBy] = useState("id_asc");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const load = async () => {
    const res = await api.get("/admin/users");
    setUsers(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => {
    load().catch((err) => console.error("Failed to load users:", err));
  }, []);

  const handleDelete = async (id) => {
    const ok = window.confirm(`Bạn chắc chắn muốn xóa user #${id}?`);
    if (!ok) return;
    try {
      await api.delete(`/admin/users/${id}`);
      alert("Xóa user thành công!");
      load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Xóa user thất bại");
    }
  };

  // ✅ FIX: ép kiểu roleId về number để so sánh đúng
  const handleChangeRole = async (userId, newRoleIdRaw) => {
    const newRoleId = Number(newRoleIdRaw);

    const roleLabel =
      newRoleId === 1 ? "admin" : newRoleId === 2 ? "staff" : "customer";

    const ok = window.confirm(
      `Bạn chắc chắn muốn đổi vai trò user #${userId} thành ${roleLabel} ?`
    );
    if (!ok) return;

    try {
      await api.put(`/admin/users/${userId}/role`, { role_id: newRoleId });
      alert("Đổi vai trò thành công!");
      load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Đổi vai trò thất bại");
    }
  };

  const roleOptions = useMemo(() => {
    const set = new Set(users.map((u) => u.role_name));
    return Array.from(set);
  }, [users]);

  const filteredSorted = useMemo(() => {
    let arr = [...users];

    if (roleFilter !== "all") {
      arr = arr.filter(
        (u) => (u.role_name || "").toLowerCase() === roleFilter.toLowerCase()
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (u) =>
          String(u.id).includes(q) ||
          (u.full_name || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q) ||
          (u.role_name || "").toLowerCase().includes(q)
      );
    }

    const getName = (u) => (u.full_name || "").toLowerCase();
    const getEmail = (u) => (u.email || "").toLowerCase();
    const getRole = (u) => (u.role_name || "").toLowerCase();

    switch (sortBy) {
      case "id_desc":
        arr.sort((a, b) => b.id - a.id);
        break;
      case "name_asc":
        arr.sort((a, b) => getName(a).localeCompare(getName(b)));
        break;
      case "name_desc":
        arr.sort((a, b) => getName(b).localeCompare(getName(a)));
        break;
      case "email_asc":
        arr.sort((a, b) => getEmail(a).localeCompare(getEmail(b)));
        break;
      case "email_desc":
        arr.sort((a, b) => getEmail(b).localeCompare(getEmail(a)));
        break;
      case "role_asc":
        arr.sort((a, b) => getRole(a).localeCompare(getRole(b)));
        break;
      case "role_desc":
        arr.sort((a, b) => getRole(b).localeCompare(getRole(a)));
        break;
      case "id_asc":
      default:
        arr.sort((a, b) => a.id - b.id);
        break;
    }

    return arr;
  }, [users, sortBy, search, roleFilter]);

  // ✅ yêu cầu 3: nếu > 10 user thì bật scroll
  const enableScroll = filteredSorted.length > 10;

  // motion variants (UI only)
  const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
  };
  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/50 to-emerald-100/80 p-6">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="flex items-center justify-between flex-wrap gap-3"
        >
          <motion.h1
            variants={fadeUp}
            className="text-2xl md:text-3xl font-extrabold text-emerald-900 flex items-center gap-2"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md shadow-emerald-700/30">
              👤
            </span>
            Quản lý người dùng
          </motion.h1>

          <motion.div
            variants={fadeUp}
            className="text-sm font-semibold text-emerald-900 bg-white/80 border border-emerald-200 rounded-full px-3 py-1 shadow-sm"
          >
            Tổng cộng:{" "}
            <span className="font-extrabold text-emerald-800">
              {users.length}
            </span>{" "}
            users
          </motion.div>
        </motion.div>

        {/* Filter bar */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="bg-white rounded-2xl border border-emerald-100 shadow-lg p-3 md:p-4"
        >
          <div className="flex flex-col md:flex-row gap-3">
            {/* sort */}
            <motion.label variants={fadeUp} className="flex items-center gap-2">
              <span className="text-xl">↕️</span>
              <select
                className="
                  border border-emerald-200 p-2.5 rounded-xl bg-white
                  font-semibold text-emerald-900
                  focus:outline-none focus:ring-2 focus:ring-emerald-300
                  hover:border-emerald-300 transition
                "
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="id_asc">ID ↑</option>
                <option value="id_desc">ID ↓</option>
                <option value="name_asc">Họ tên ↑</option>
                <option value="name_desc">Họ tên ↓</option>
                <option value="email_asc">Email ↑</option>
                <option value="email_desc">Email ↓</option>
                <option value="role_asc">Vai trò ↑</option>
                <option value="role_desc">Vai trò ↓</option>
              </select>
            </motion.label>

            {/* search */}
            <motion.label variants={fadeUp} className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">
                🔎
              </span>
              <input
                className="
                  w-full border border-emerald-200 p-2.5 pl-10 rounded-xl
                  font-semibold text-emerald-900 placeholder:text-gray-400
                  focus:outline-none focus:ring-2 focus:ring-emerald-300
                  hover:border-emerald-300 transition
                "
                placeholder="Tìm theo ID / Họ tên / Email / Vai trò"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </motion.label>

            {/* role filter */}
            <motion.label variants={fadeUp} className="flex items-center gap-2">
              <span className="text-xl">🎛️</span>
              <select
                className="
                  border border-emerald-200 p-2.5 rounded-xl bg-white
                  font-semibold text-emerald-900
                  focus:outline-none focus:ring-2 focus:ring-emerald-300
                  hover:border-emerald-300 transition
                "
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">Tất cả vai trò</option>
                {roleOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </motion.label>
          </div>
        </motion.div>

        {/* Table container */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`
            bg-white rounded-2xl border border-emerald-100 shadow-xl
            ${enableScroll ? "max-h-[560px] overflow-auto" : "overflow-hidden"}
          `}
        >
          <table className="min-w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-r from-emerald-700 via-green-600 to-lime-500 text-white">
                <th className="p-3 text-left font-extrabold">ID</th>
                <th className="p-3 text-left font-extrabold">Họ tên</th>
                <th className="p-3 text-left font-extrabold">Email</th>
                <th className="p-3 text-left font-extrabold">Vai trò</th>
                <th className="p-3 text-center font-extrabold">Tùy chỉnh</th>
                <th className="p-3 text-center font-extrabold">Xóa</th>
              </tr>
            </thead>

            <tbody>
              <AnimatePresence initial={false}>
                {filteredSorted.map((u) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.25 }}
                    className="border-b hover:bg-emerald-50/70 transition-colors"
                  >
                    <td className="p-3 font-bold text-emerald-900">
                      #{u.id}
                    </td>
                    <td className="p-3 font-semibold text-gray-900">
                      {u.full_name}
                    </td>
                    <td className="p-3 text-gray-700 font-medium">
                      {u.email}
                    </td>

                    <td className="p-3">
                      <span
                        className="
                          inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold
                          bg-emerald-50 text-emerald-900 border border-emerald-100
                        "
                      >
                        {u.role_id === 1 ? "🛡️" : u.role_id === 2 ? "🧑‍🔧" : "🪴"}{" "}
                        {u.role_name}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <select
                        className="
                          border border-emerald-200 px-3 py-2 rounded-xl bg-white
                          font-semibold text-emerald-900
                          hover:border-emerald-300 transition
                          focus:outline-none focus:ring-2 focus:ring-emerald-300
                        "
                        value={u.role_id}
                        onChange={(e) => handleChangeRole(u.id, e.target.value)}
                      >
                        <option value={1}>admin</option>
                        <option value={2}>staff</option>
                        <option value={3}>customer</option>
                      </select>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="
                          inline-flex items-center gap-1
                          bg-red-600 text-white px-3 py-1.5 rounded-xl font-bold
                          shadow-md shadow-red-600/25
                          hover:bg-red-700 hover:shadow-lg
                          active:scale-[0.97]
                          transition-all duration-200
                        "
                      >
                        🗑️ Xóa
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {filteredSorted.length === 0 && (
            <div className="p-6 text-center text-gray-500 font-semibold">
              Không có người dùng phù hợp.
            </div>
          )}
        </motion.div>

        <ScrollToTopButton />
      </div>
    </div>
  );
}
