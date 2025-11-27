import { useEffect, useState } from "react";
import api from "../../api/api";

export default function Vouchers() {
  const [vouchers, setVouchers] = useState([]);

  useEffect(() => {
    api.get("/vouchers/me")
      .then((res) => setVouchers(Array.isArray(res.data) ? res.data : []))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-6">🎟️ Voucher của tôi</h1>

      {vouchers.length === 0 ? (
        <p className="text-gray-500">Bạn chưa có voucher nào.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {vouchers.map((v) => (
            <div key={v.code} className="bg-white p-4 rounded-xl shadow">
              <div className="font-semibold text-lg">{v.code}</div>
              <div className="text-green-700 mt-1">Giảm {v.discount_percent}%</div>
              <div className="text-sm text-gray-500">
                Hết hạn: {new Date(v.expires_at).toLocaleString()}
              </div>
              <div className="mt-2 text-sm">
                Trạng thái: {v.is_used ? "Đã dùng" : "Chưa dùng"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
