// import { Link } from "react-router-dom";

// export default function AdminDashboard() {
//   const stats = [
//     { label: "Tổng đơn hàng", value: 120 },
//     { label: "Nhân viên", value: 15 },
//     { label: "Khách hàng", value: 230 },
//     { label: "Doanh thu (tháng)", value: "$3,400" },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <header className="flex justify-between items-center mb-8">
//         <h1 className="text-2xl font-bold text-green-700">Bảng điều khiển quản trị</h1>
//         <Link to="/login" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
//           Đăng xuất
//         </Link>
//       </header>

//       <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//         {stats.map((item, i) => (
//           <div key={i} className="bg-white p-4 rounded-lg shadow text-center">
//             <p className="text-sm text-gray-500">{item.label}</p>
//             <p className="text-2xl font-bold text-green-700">{item.value}</p>
//           </div>
//         ))}
//       </section>

//       <section>
//         <h2 className="text-xl font-semibold mb-4">Quản lý hệ thống</h2>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <Link to="/admin/users" className="bg-white p-6 rounded-lg shadow text-center hover:bg-green-50">
//             👤 Người dùng
//           </Link>
//           <Link to="/admin/services" className="bg-white p-6 rounded-lg shadow text-center hover:bg-green-50">
//             🌿 Dịch vụ
//           </Link>
//           <Link to="/admin/orders" className="bg-white p-6 rounded-lg shadow text-center hover:bg-green-50">
//             🧾 Đơn hàng
//           </Link>
//           <Link to="/admin/reports" className="bg-white p-6 rounded-lg shadow text-center hover:bg-green-50">
//             📊 Báo cáo
//           </Link>
//         </div>
//       </section>
//     </div>
//   );
// }













import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-green-700">Bảng điều khiển quản trị</h1>
      </header>

      {!stats ? (
        <p>Đang tải...</p>
      ) : (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Tổng đơn hàng" value={stats.orders} />
          <StatCard label="Nhân viên" value={stats.staff} />
          <StatCard label="Khách hàng" value={stats.customers} />
          <StatCard label="Doanh thu tháng" value={`$${stats.revenue}`} />
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-4">Quản lý hệ thống</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AdminLink label="👤 Người dùng" to="/admin/users" />
          <AdminLink label="🌿 Dịch vụ" to="/admin/services" />
          <AdminLink label="🧾 Đơn hàng" to="/admin/orders" />
          <AdminLink label="📊 Báo cáo" to="/admin/reports" />
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow text-center">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-green-700">{value}</p>
    </div>
  );
}

function AdminLink({ label, to }) {
  return (
    <Link
      to={to}
      className="bg-white p-6 rounded-lg shadow text-center hover:bg-green-50"
    >
      {label}
    </Link>
  );
}
