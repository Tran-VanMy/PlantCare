// client/src/pages/Auth/RegisterPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role_id: 3, // mặc định customer
    phone: "",
    address: ""
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Tạo tài khoản</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="full_name"
            placeholder="Họ tên"
            className="border p-2 rounded"
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="border p-2 rounded"
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Mật khẩu"
            className="border p-2 rounded"
            onChange={handleChange}
            required
          />

          <input
            name="phone"
            type="text"
            placeholder="Số điện thoại"
            className="border p-2 rounded"
            value={form.phone}
            onChange={handleChange}
          />

          <input
            name="address"
            type="text"
            placeholder="Địa chỉ"
            className="border p-2 rounded"
            value={form.address}
            onChange={handleChange}
          />

          <select
            name="role_id"
            className="border p-2 rounded"
            value={form.role_id}
            onChange={handleChange}
          >
            <option value={3}>Khách hàng</option>
            <option value={2}>Nhân viên</option>
            <option value={1}>Quản trị viên</option>
          </select>
          <button className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
            Đăng ký
          </button>
        </form>
        {error && <p className="text-red-600 text-center mt-3">{error}</p>}
        <p className="text-center text-sm mt-4">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-green-600 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
