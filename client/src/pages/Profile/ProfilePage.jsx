import { useEffect, useState } from "react";
import api from "../../api/api";

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

  if (!user) return <p>Đang tải thông tin...</p>;

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-6">
        👤 Thông tin cá nhân
      </h1>

      {msg && (
        <div className="mb-4 p-3 bg-white rounded shadow text-green-700">
          {msg}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Thông tin */}
        <form
          onSubmit={updateInfo}
          className="bg-white p-5 rounded-xl shadow space-y-3"
        >
          <h2 className="font-semibold text-lg">Thông tin tài khoản</h2>

          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              value={user.email}
              disabled
              className="border p-2 rounded w-full bg-gray-100"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Họ tên</label>
            <input
              className="border p-2 rounded w-full"
              value={form.full_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, full_name: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Số điện thoại</label>
            <input
              className="border p-2 rounded w-full"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Địa chỉ</label>
            <input
              className="border p-2 rounded w-full"
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
            />
          </div>

          <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
            Lưu thay đổi
          </button>
        </form>

        {/* Đổi mật khẩu */}
        <form
          onSubmit={changePassword}
          className="bg-white p-5 rounded-xl shadow space-y-3"
        >
          <h2 className="font-semibold text-lg">Đổi mật khẩu</h2>

          <input
            type="password"
            placeholder="Mật khẩu cũ"
            className="border p-2 rounded w-full"
            value={pwForm.old_password}
            onChange={(e) =>
              setPwForm((p) => ({ ...p, old_password: e.target.value }))
            }
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu mới"
            className="border p-2 rounded w-full"
            value={pwForm.new_password}
            onChange={(e) =>
              setPwForm((p) => ({ ...p, new_password: e.target.value }))
            }
            required
          />

          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Đổi mật khẩu
          </button>
        </form>
      </div>
    </div>
  );
}
