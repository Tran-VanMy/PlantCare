// // 📂 src/pages/customer/OrderHistory.jsx
// import { useEffect, useState } from "react";
// // import api from "../../api/api"; // ❌ Tạm tắt API thật trong lúc giả lập

// export default function OrderHistory() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // ⚙️ Giả lập người dùng đăng nhập
//     const storedUser = JSON.parse(localStorage.getItem("user")) || {
//       id: 1,
//       name: "Nguyễn Văn A",
//     };

//     // ⚙️ Giả lập API trả về danh sách đơn hàng
//     const fakeOrders = [
//       {
//         id: 101,
//         service: "Tưới cây tự động định kỳ",
//         total: 25.5,
//         date: "2025-11-01T10:00:00Z",
//         status: "Hoàn thành",
//       },
//       {
//         id: 102,
//         service: "Cắt tỉa bonsai mini",
//         total: 15.0,
//         date: "2025-11-05T15:30:00Z",
//         status: "Đang xử lý",
//       },
//       {
//         id: 103,
//         service: "Chăm sóc cây cảnh tại nhà",
//         total: 35.75,
//         date: "2025-10-28T09:00:00Z",
//         status: "Đã hủy",
//       },
//     ];

//     // ⚙️ Giả lập gọi API
//     const fetchOrders = async () => {
//       try {
//         // Nếu sau này có backend thì bật lại dòng này:
//         // const res = await api.get(`/customers/${storedUser.id}/orders`);
//         // setOrders(res.data.sort((a, b) => new Date(b.date) - new Date(a.date)));

//         // Hiện tại dùng dữ liệu giả lập
//         await new Promise((resolve) => setTimeout(resolve, 1000)); // ⏳ delay 1s để giống API
//         setOrders(fakeOrders.sort((a, b) => new Date(b.date) - new Date(a.date)));
//       } catch (err) {
//         console.error("Lỗi khi lấy lịch sử đơn hàng:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, []);

//   if (loading) return <p>Đang tải đơn hàng...</p>;
//   if (orders.length === 0) return <p>Bạn chưa có đơn hàng nào.</p>;

//   return (
//     <div className="min-h-screen bg-green-50 p-6">
//       <h1 className="text-2xl font-bold text-green-700 mb-6">
//         🧾 Lịch sử đơn hàng
//       </h1>
//       <table className="min-w-full bg-white rounded-lg shadow">
//         <thead>
//           <tr className="bg-green-100">
//             <th className="p-3 text-left">Mã đơn</th>
//             <th className="p-3 text-left">Dịch vụ</th>
//             <th className="p-3 text-left">Tổng ($)</th>
//             <th className="p-3 text-left">Ngày hẹn</th>
//             <th className="p-3 text-left">Trạng thái</th>
//           </tr>
//         </thead>
//         <tbody>
//           {orders.map((order) => (
//             <tr key={order.id} className="border-b hover:bg-green-50">
//               <td className="p-3">{order.id}</td>
//               <td className="p-3">{order.service}</td>
//               <td className="p-3">{order.total.toFixed(2)}</td>
//               <td className="p-3">
//                 {new Date(order.date).toLocaleDateString("vi-VN")}
//               </td>
//               <td
//                 className={`p-3 font-semibold ${
//                   order.status === "Hoàn thành"
//                     ? "text-green-600"
//                     : order.status === "Đã hủy"
//                     ? "text-red-600"
//                     : "text-yellow-600"
//                 }`}
//               >
//                 {order.status}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }










import { useEffect, useState } from "react";
import api from "../../api/api";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) return;

    const fetchOrders = async () => {
      try {
        const res = await api.get(`/customers/${storedUser.id}/orders`);
        // Sắp xếp từ mới nhất
        setOrders(res.data.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } catch (err) {
        console.error("Lỗi khi lấy lịch sử đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p>Đang tải đơn hàng...</p>;
  if (orders.length === 0) return <p>Bạn chưa có đơn hàng nào.</p>;

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-6">🧾 Lịch sử đơn hàng</h1>
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead>
          <tr className="bg-green-100">
            <th className="p-3 text-left">Mã đơn</th>
            <th className="p-3 text-left">Dịch vụ</th>
            <th className="p-3 text-left">Tổng ($)</th>
            <th className="p-3 text-left">Ngày hẹn</th>
            <th className="p-3 text-left">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b hover:bg-green-50">
              <td className="p-3">{order.id}</td>
              <td className="p-3">{order.service}</td>
              <td className="p-3">{order.total.toFixed(2)}</td>
              <td className="p-3">{new Date(order.date).toLocaleDateString()}</td>
              <td className="p-3 text-green-700">{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
