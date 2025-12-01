// client/src/components/common/BookingModal.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

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
      api.get("/services")
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
    api.get(`/customers/${user.id}/plants`)
      .then((r) => setPlants(Array.isArray(r.data) ? r.data : []))
      .catch(() => setPlants([]));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const token = localStorage.getItem("token");
    if (!token) return setVouchers([]);
    api.get("/vouchers/me")
      .then((res) => setVouchers(Array.isArray(res.data) ? res.data : []))
      .catch(() => setVouchers([]));
  }, [isOpen]);

  const toggleService = (s) => {
    if (singleService) return;
    const exists = selected.find((x) => x.id === s.id);
    if (exists) setSelected(selected.filter((x) => x.id !== s.id));
    else setSelected([...selected, { ...s, qty: 1 }]);
  };

  const changeQty = (id, delta) => {
    setSelected((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, qty: Math.max(1, p.qty + delta) } : p
      )
    );
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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
      `Đặt qua web - ${singleService ? `service:${singleService.name}` : "Plant Care"}`;

    setLoading(true);
    try {
      const payloadServices = selected.map((s) => ({
        service_id: s.id,
        quantity: s.qty || 1,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6 z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Đặt lịch chăm sóc cây</h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            ✕
          </button>
        </div>

        {/* ✅ FIX: KHÔNG stretch nữa */}
        <div className="grid md:grid-cols-2 gap-4 items-start">
          {/* LEFT: services */}
          <div className="flex flex-col">
            <h4 className="font-semibold mb-2">Chọn dịch vụ</h4>

            {/* ✅ auto height, chỉ scroll khi quá dài */}
            <div className="space-y-2 max-h-[420px] overflow-auto pr-2 border rounded-xl p-2">
              {list.map((s) => {
                const picked = selected.find((x) => x.id === s.id);
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between border p-3 rounded-xl hover:shadow-sm"
                  >
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-sm text-gray-500">
                        {s.description?.slice(0, 80)}
                      </div>
                      <div className="text-sm text-green-700">
                        ${s.price} • {s.duration_minutes} mins
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!singleService && (
                        <input
                          type="checkbox"
                          checked={!!picked}
                          onChange={() => toggleService(s)}
                        />
                      )}

                      {picked && (
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            type="button"
                            onClick={() => changeQty(s.id, -1)}
                            className="px-2"
                          >
                            -
                          </button>
                          <span>{picked.qty}</span>
                          <button
                            type="button"
                            onClick={() => changeQty(s.id, +1)}
                            className="px-2"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: form */}
          <form onSubmit={handleBook} className="space-y-3 flex flex-col">
            <h4 className="font-semibold">Thông tin khách hàng</h4>

            <input
              name="name"
              placeholder="Họ tên"
              className="border p-2 rounded w-full"
              value={form.name}
              onChange={handleChange}
              required
            />

            <input
              name="phone"
              placeholder="Số điện thoại (có thể để trống)"
              className="border p-2 rounded w-full"
              value={form.phone}
              onChange={handleChange}
            />

            <input
              name="address"
              placeholder="Địa chỉ"
              className="border p-2 rounded w-full"
              value={form.address}
              onChange={handleChange}
              required
            />

            <textarea
              name="note"
              placeholder="Ghi chú (tuỳ chọn)"
              className="border p-2 rounded w-full h-20"
              value={form.note}
              onChange={handleChange}
            />

            <select
              name="voucher_code"
              className="border p-2 rounded w-full bg-white"
              value={form.voucher_code}
              onChange={handleChange}
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
            </select>

            <select
              name="plant_id"
              className="border p-2 rounded w-full"
              value={form.plant_id}
              onChange={handleChange}
            >
              <option value="">Chọn cây cần chăm</option>
              {plants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.type || "—"})
                </option>
              ))}
            </select>

            <label className="block">
              <div className="text-sm mb-1">Chọn ngày</div>
              <input
                name="date"
                type="datetime-local"
                className="border p-2 rounded w-full"
                value={form.date}
                onChange={handleChange}
                required
              />
            </label>

            <div className="mt-auto flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              >
                {loading ? "Đang xử lý..." : "Đặt lịch"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
