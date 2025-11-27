import { useEffect, useState } from "react";
import api from "../../api/api";
import { Link } from "react-router-dom";

export default function StaffDashboard() {
  const [available, setAvailable] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);

  const load = async () => {
    const av = await api.get("/staff/orders/available");
    setAvailable(av.data || []);

    const tk = await api.get("/staff/tasks");
    setTasks(tk.data || []);

    const st = await api.get("/staff/stats/income");
    setStats(st.data);
  };

  useEffect(() => { load().catch(console.error); }, []);

  const accept = async (id) => {
    await api.put(`/staff/orders/${id}/accept`);
    load();
  };

  return (
    <div className="min-h-screen bg-green-50 p-6 space-y-8">
      <h1 className="text-2xl font-bold text-green-700">Bảng điều khiển nhân viên</h1>

      {/* Stats + bonus */}
      {stats && (
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Thu nhập & Thưởng</h2>
          <div className="text-sm text-gray-600 mb-2">Thưởng mốc chẵn 2,4,6,8,10... sau mỗi đơn hoàn tất.</div>
          <ul className="text-sm list-disc pl-5">
            {stats.bonuses?.map((b) => (
              <li key={b.order_id}>
                Đơn #{b.order_id}: thưởng mốc {b.milestone} = ${b.bonus_amount}
              </li>
            ))}
            {(!stats.bonuses || stats.bonuses.length === 0) && <li>Chưa có thưởng.</li>}
          </ul>
        </div>
      )}

      {/* Available orders */}
      <section className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-3">Đơn chờ nhận</h2>
        {available.length === 0 ? (
          <p className="text-gray-500">Không có đơn mới.</p>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="bg-green-100 text-left">
                <th className="p-2">Mã đơn</th>
                <th className="p-2">Khách</th>
                <th className="p-2">Dịch vụ</th>
                <th className="p-2">Cây</th>
                <th className="p-2">Ngày hẹn</th>
                <th className="p-2">Địa chỉ</th>
                <th className="p-2">SĐT</th>
                <th className="p-2">Tổng</th>
                <th className="p-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {available.map((o) => (
                <tr key={o.id} className="border-b hover:bg-green-50">
                  <td className="p-2">{o.id}</td>
                  <td className="p-2">{o.customer_name}</td>
                  <td className="p-2">{o.services}</td>
                  <td className="p-2">{o.plant_name || "—"}</td>
                  <td className="p-2">{new Date(o.scheduled_date).toLocaleString()}</td>
                  <td className="p-2">{o.address}</td>
                  <td className="p-2">{o.customer_phone || "—"}</td>
                  <td className="p-2">${o.total_price}</td>
                  <td className="p-2">
                    <button onClick={() => accept(o.id)} className="px-3 py-1 bg-green-600 text-white rounded">
                      Nhận đơn
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* My tasks */}
      <section className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-3">Đơn của tôi</h2>
        {tasks.length === 0 ? (
          <p className="text-gray-500">Chưa có đơn nào.</p>
        ) : (
          <div className="grid gap-3">
            {tasks.map((t) => (
              <div key={t.id} className="border rounded-lg p-3 flex justify-between items-center">
                <div>
                  <div className="font-semibold">Đơn #{t.id} — {t.services}</div>
                  <div className="text-sm text-gray-600">{t.customer_name} • {t.address}</div>
                  <div className="text-sm text-green-700">{t.status_vn}</div>
                </div>
                <Link to={`/staff/visit/${t.id}`} className="px-3 py-1 bg-blue-600 text-white rounded">
                  Chi tiết
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
