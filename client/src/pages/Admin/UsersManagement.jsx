// client/src/pages/Admin/UsersManagement.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../../api/api";

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-4">
        Quản lý người dùng
      </h1>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <select
          className="border p-2 rounded bg-white"
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

        <input
          className="border p-2 rounded flex-1"
          placeholder="Tìm theo ID / Họ tên / Email / Vai trò"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex items-center gap-2">
          <span title="Lọc theo vai trò" className="text-xl">
            🔽
          </span>
          <select
            className="border p-2 rounded bg-white"
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
        </div>
      </div>

      <table className="min-w-full bg-white rounded-lg shadow">
        <thead>
          <tr className="bg-green-100">
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Họ tên</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Vai trò</th>
            <th className="p-3 text-center">Tùy chỉnh</th>
            <th className="p-3 text-center">Xóa tài khoản</th>
          </tr>
        </thead>
        <tbody>
          {filteredSorted.map((u) => (
            <tr key={u.id} className="border-b hover:bg-green-50">
              <td className="p-3">{u.id}</td>
              <td className="p-3">{u.full_name}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3">{u.role_name}</td>

              <td className="p-3 text-center">
                <select
                  className="border p-2 rounded bg-white"
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
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
