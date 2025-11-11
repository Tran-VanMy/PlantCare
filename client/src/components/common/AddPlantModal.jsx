// client/src/components/common/AddPlantModal.jsx
import { useState } from "react";
import api from "../../api/api";

export default function AddPlantModal({ isOpen, onClose, onAdded }) {
  const [form, setForm] = useState({
    name: "",
    type: "",
    location: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6 z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Thêm cây mới</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input name="name" placeholder="Tên cây" className="border p-2 rounded"
            required value={form.name} onChange={handleChange} />
          <input name="type" placeholder="Loại" className="border p-2 rounded"
            value={form.type} onChange={handleChange} />
          <input name="location" placeholder="Vị trí" className="border p-2 rounded"
            value={form.location} onChange={handleChange} />
          <textarea name="description" placeholder="Mô tả" className="border p-2 rounded"
            value={form.description} onChange={handleChange} />
          <div className="flex justify-end gap-2 mt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Hủy</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">
              {loading ? "Đang xử lý..." : "Thêm cây"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
