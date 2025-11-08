// import { useState } from "react";

// export default function OrdersManagement() {
//   const [orders, setOrders] = useState([
//     {
//       id: 101,
//       customer: "Nguyễn Văn A",
//       service: "Tưới cây",
//       total: 10,
//       date: "2025-11-08",
//       status: "pending",
//     },
//     {
//       id: 102,
//       customer: "Trần Thị B",
//       service: "Cắt tỉa",
//       total: 15,
//       date: "2025-11-09",
//       status: "confirmed",
//     },
//     {
//       id: 103,
//       customer: "Lê Văn C",
//       service: "Kiểm soát sâu bệnh",
//       total: 8,
//       date: "2025-11-10",
//       status: "completed",
//     },
//   ]);

//   const statusColor = (status) => {
//     switch (status) {
//       case "pending":
//         return "bg-yellow-100 text-yellow-700";
//       case "confirmed":
//         return "bg-blue-100 text-blue-700";
//       case "completed":
//         return "bg-green-100 text-green-700";
//       case "cancelled":
//         return "bg-red-100 text-red-700";
//       default:
//         return "bg-gray-100 text-gray-700";
//     }
//   };

//   const updateStatus = (id, newStatus) => {
//     setOrders((prev) =>
//       prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <h1 className="text-2xl font-bold text-green-700 mb-6">
//         Quản lý đơn hàng
//       </h1>

//       <table className="min-w-full bg-white rounded-lg shadow">
//         <thead>
//           <tr className="bg-green-100 text-left">
//             <th className="p-3">Mã đơn</th>
//             <th className="p-3">Khách hàng</th>
//             <th className="p-3">Dịch vụ</th>
//             <th className="p-3">Tổng ($)</th>
//             <th className="p-3">Ngày hẹn</th>
//             <th className="p-3">Trạng thái</th>
//             <th className="p-3 text-center">Hành động</th>
//           </tr>
//         </thead>
//         <tbody>
//           {orders.map((order) => (
//             <tr key={order.id} className="border-b hover:bg-green-50">
//               <td className="p-3">{order.id}</td>
//               <td className="p-3">{order.customer}</td>
//               <td className="p-3">{order.service}</td>
//               <td className="p-3">{order.total.toFixed(2)}</td>
//               <td className="p-3">{order.date}</td>
//               <td className="p-3">
//                 <span
//                   className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor(
//                     order.status
//                   )}`}
//                 >
//                   {order.status}
//                 </span>
//               </td>
//               <td className="p-3 text-center space-x-2">
//                 {order.status === "pending" && (
//                   <>
//                     <button
//                       onClick={() => updateStatus(order.id, "confirmed")}
//                       className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
//                     >
//                       Duyệt
//                     </button>
//                     <button
//                       onClick={() => updateStatus(order.id, "cancelled")}
//                       className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
//                     >
//                       Hủy
//                     </button>
//                   </>
//                 )}
//                 {order.status === "confirmed" && (
//                   <button
//                     onClick={() => updateStatus(order.id, "completed")}
//                     className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
//                   >
//                     Hoàn thành
//                   </button>
//                 )}
//                 <button
//                   className="text-green-700 underline hover:text-green-900"
//                   onClick={() => alert(`Xem chi tiết đơn ${order.id}`)}
//                 >
//                   Xem
//                 </button>
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

export default function OrdersManagement() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/admin/orders")
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Failed to load orders:", err));
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/admin/orders/${id}`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-6">Quản lý đơn hàng</h1>

      <table className="min-w-full bg-white rounded-lg shadow">
        <thead>
          <tr className="bg-green-100">
            <th className="p-3">Mã Đơn</th>
            <th className="p-3">Khách hàng</th>
            <th className="p-3">Dịch vụ</th>
            <th className="p-3">Tổng ($)</th>
            <th className="p-3">Ngày hẹn</th>
            <th className="p-3">Trạng thái</th>
            <th className="p-3">Hành động</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b hover:bg-green-50">
              <td className="p-3">{order.id}</td>
              <td className="p-3">{order.customer_name}</td>
              <td className="p-3">{order.service_name}</td>
              <td className="p-3">${order.total}</td>
              <td className="p-3">{order.date}</td>

              <td className="p-3">
                <span className={`px-3 py-1 rounded-full text-sm ${statusColor(order.status)}`}>
                  {order.status}
                </span>
              </td>

              <td className="p-3 space-x-2 text-center">
                {order.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateStatus(order.id, "confirmed")}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >Duyệt</button>

                    <button
                      onClick={() => updateStatus(order.id, "cancelled")}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >Hủy</button>
                  </>
                )}

                {order.status === "confirmed" && (
                  <button
                    onClick={() => updateStatus(order.id, "completed")}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Hoàn thành
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}

function statusColor(status) {
  switch (status) {
    case "pending": return "bg-yellow-100 text-yellow-700";
    case "confirmed": return "bg-blue-100 text-blue-700";
    case "completed": return "bg-green-100 text-green-700";
    case "cancelled": return "bg-red-100 text-red-700";
    default: return "bg-gray-100 text-gray-700";
  }
}
