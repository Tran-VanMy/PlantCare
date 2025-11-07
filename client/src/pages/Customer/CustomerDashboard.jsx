// // src/pages/Customer/CustomerDashboard.jsx
// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import api from "../../api/api";

// export default function CustomerDashboard() {
//   const [user, setUser] = useState(null);
//   const [stats, setStats] = useState({
//     plants: 0,
//     orders: 0,
//     totalSpent: 0,
//   });
//   const [recentOrders, setRecentOrders] = useState([]);

//   useEffect(() => {
//     const storedUser = JSON.parse(localStorage.getItem("user"));
//     setUser(storedUser);

//     // ✅ Giả lập dữ liệu mock (sau này gọi từ API thực)
//     setStats({ plants: 3, orders: 5, totalSpent: 120 });
//     setRecentOrders([
//       { id: 101, service: "Tưới cây", date: "2025-11-05", status: "Hoàn thành" },
//       { id: 102, service: "Cắt tỉa", date: "2025-11-10", status: "Đang chờ" },
//       { id: 103, service: "Bón phân", date: "2025-11-15", status: "Đã xác nhận" },
//     ]);
//   }, []);

//   return (
//     <div className="min-h-screen bg-green-50 p-6">
//       {/* Header chào khách */}
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-green-700 mb-2">
//           Xin chào, {user?.full_name || "Khách hàng"} 🌿
//         </h1>
//         <p className="text-gray-600">
//           Chúc bạn một ngày tốt lành! Dưới đây là thông tin về tài khoản và các đơn hàng của bạn.
//         </p>
//       </div>

//       {/* Thống kê nhanh */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
//         <div className="bg-white p-6 rounded-lg shadow text-center">
//           <p className="text-sm text-gray-500">Cây của bạn</p>
//           <p className="text-3xl font-bold text-green-700">{stats.plants}</p>
//         </div>
//         <div className="bg-white p-6 rounded-lg shadow text-center">
//           <p className="text-sm text-gray-500">Tổng đơn hàng</p>
//           <p className="text-3xl font-bold text-green-700">{stats.orders}</p>
//         </div>
//         <div className="bg-white p-6 rounded-lg shadow text-center">
//           <p className="text-sm text-gray-500">Tổng chi tiêu ($)</p>
//           <p className="text-3xl font-bold text-green-700">{stats.totalSpent}</p>
//         </div>
//       </div>

//       {/* Danh sách đơn hàng gần nhất */}
//       <section className="bg-white rounded-lg shadow p-6">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-semibold text-green-700">Đơn hàng gần đây</h2>
//           <Link
//             to="/customer/orders"
//             className="text-green-600 hover:underline"
//           >
//             Xem tất cả
//           </Link>
//         </div>

//         <table className="min-w-full">
//           <thead>
//             <tr className="bg-green-100 text-left">
//               <th className="p-3">Mã đơn</th>
//               <th className="p-3">Dịch vụ</th>
//               <th className="p-3">Ngày hẹn</th>
//               <th className="p-3">Trạng thái</th>
//             </tr>
//           </thead>
//           <tbody>
//             {recentOrders.map((order) => (
//               <tr key={order.id} className="border-b hover:bg-green-50">
//                 <td className="p-3">{order.id}</td>
//                 <td className="p-3">{order.service}</td>
//                 <td className="p-3">{order.date}</td>
//                 <td className="p-3 text-green-700">{order.status}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </section>

//       {/* Nút hành động */}
//       <div className="mt-8 flex gap-4">
//         <Link
//           to="/customer/my-plants"
//           className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
//         >
//           🌱 Quản lý cây
//         </Link>
//         <Link
//           to="/customer/orders"
//           className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300"
//         >
//           🧾 Lịch sử đơn hàng
//         </Link>
//       </div>
//     </div>
//   );
// }




import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";

export default function CustomerDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ plants: 0, orders: 0, totalSpent: 0 });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) return;
    setUser(storedUser);

    const customerId = storedUser.id; // hoặc storedUser.user_id theo BE
    const fetchData = async () => {
      try {
        // 1️⃣ Lấy cây
        const plantsRes = await api.get(`/customers/${customerId}/plants`);
        const plantsCount = plantsRes.data.length;

        // 2️⃣ Lấy đơn hàng
        const ordersRes = await api.get(`/customers/${customerId}/orders`);
        const orders = ordersRes.data;
        const ordersCount = orders.length;
        const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

        // 3️⃣ Lấy 3 đơn gần nhất
        const recent = orders
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 3);

        setStats({ plants: plantsCount, orders: ordersCount, totalSpent });
        setRecentOrders(recent);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu dashboard:", err);
      }
    };

    fetchData();
  }, []);

  if (!user) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="min-h-screen bg-green-50 p-6">
      {/* Header chào khách */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-700 mb-2">
          Xin chào, {user.full_name || user.name} 🌿
        </h1>
        <p className="text-gray-600">
          Chúc bạn một ngày tốt lành! Dưới đây là thông tin về tài khoản và các đơn hàng của bạn.
        </p>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-sm text-gray-500">Cây của bạn</p>
          <p className="text-3xl font-bold text-green-700">{stats.plants}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-sm text-gray-500">Tổng đơn hàng</p>
          <p className="text-3xl font-bold text-green-700">{stats.orders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-sm text-gray-500">Tổng chi tiêu ($)</p>
          <p className="text-3xl font-bold text-green-700">{stats.totalSpent}</p>
        </div>
      </div>

      {/* Danh sách đơn hàng gần nhất */}
      <section className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-green-700">Đơn hàng gần đây</h2>
          <Link to="/customer/orders" className="text-green-600 hover:underline">
            Xem tất cả
          </Link>
        </div>

        <table className="min-w-full">
          <thead>
            <tr className="bg-green-100 text-left">
              <th className="p-3">Mã đơn</th>
              <th className="p-3">Dịch vụ</th>
              <th className="p-3">Ngày hẹn</th>
              <th className="p-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-green-50">
                <td className="p-3">{order.id}</td>
                <td className="p-3">{order.service}</td>
                <td className="p-3">{order.date}</td>
                <td className="p-3 text-green-700">{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Nút hành động */}
      <div className="mt-8 flex gap-4">
        <Link
          to="/customer/my-plants"
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          🌱 Quản lý cây
        </Link>
        <Link
          to="/customer/orders"
          className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300"
        >
          🧾 Lịch sử đơn hàng
        </Link>
      </div>
    </div>
  );
}
