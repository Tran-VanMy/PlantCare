// import { useParams } from "react-router-dom";

// export default function VisitDetail() {
//   const { id } = useParams();

//   return (
//     <div className="min-h-screen bg-green-50 p-6">
//       <h1 className="text-2xl font-bold text-green-700 mb-6">Chi tiết công việc {id}</h1>

//       <div className="bg-white p-6 rounded-lg shadow-lg">
//         <p><strong>Khách hàng:</strong> Nguyễn Văn A</p>
//         <p><strong>Địa chỉ:</strong> 123 Trần Phú</p>
//         <p><strong>Ngày thực hiện:</strong> 07/11/2025</p>
//         <p><strong>Dịch vụ:</strong> Cắt tỉa, Tưới nước</p>
//         <p><strong>Ghi chú:</strong> Cây bị vàng lá, cần chăm thêm</p>

//         <div className="mt-6 flex gap-4">
//           <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
//             Bắt đầu công việc
//           </button>
//           <button className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
//             Hoàn thành
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }




































// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import api from "../../api/api";

// export default function VisitDetail() {
//   const { id } = useParams();
//   const [task, setTask] = useState(null);

//   const load = () => {
//     api.get(`/staff/tasks/${id}`).then(res => setTask(res.data));
//   };

//   useEffect(() => {
//     load();
//   }, []);

//   if (!task) return <p>Đang tải...</p>;

//   const start = () => api.put(`/staff/tasks/${id}/start`).then(load);
//   const complete = () => api.put(`/staff/tasks/${id}/complete`).then(load);

//   return (
//     <div className="min-h-screen bg-green-50 p-6">
//       <h1 className="text-2xl font-bold text-green-700 mb-6">
//         Chi tiết công việc {id}
//       </h1>

//       <div className="bg-white p-6 rounded-lg shadow-lg">
//         <p><strong>Khách hàng:</strong> {task.customer_name}</p>
//         <p><strong>Địa chỉ:</strong> {task.address}</p>
//         <p><strong>Ngày thực hiện:</strong> {task.scheduled_date}</p>
//         <p><strong>Dịch vụ:</strong> {task.services}</p>
//         <p><strong>Ghi chú:</strong> {task.description}</p>

//         <div className="mt-6 flex gap-4">
//           <button
//             onClick={start}
//             className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
//           >
//             Bắt đầu công việc
//           </button>

//           <button
//             onClick={complete}
//             className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
//           >
//             Hoàn thành
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }











// // client/src/pages/Staff/VisitDetail.jsx
// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import api from "../../api/api";

// export default function VisitDetail() {
//   const { id } = useParams();
//   const [task, setTask] = useState(null);

//   const load = () => {
//     api.get(`/staff/tasks/${id}`).then(res => setTask(res.data)).catch(err => {
//       console.error("load visit detail error", err);
//       setTask(null);
//     });
//   };

//   useEffect(() => {
//     load();
//   }, [id]);

//   if (!task) return <p>Đang tải...</p>;

//   const start = () => api.put(`/staff/tasks/${id}/start`).then(load);
//   const complete = () => api.put(`/staff/tasks/${id}/complete`).then(load);

//   return (
//     <div className="min-h-screen bg-green-50 p-6">
//       <h1 className="text-2xl font-bold text-green-700 mb-6">Chi tiết công việc {id}</h1>

//       <div className="bg-white p-6 rounded-lg shadow-lg">
//         <p><strong>Khách hàng:</strong> {task.customer_name}</p>
//         <p><strong>Số điện thoại:</strong> {task.customer_phone || "—"}</p>
//         <p><strong>Địa chỉ:</strong> {task.address}</p>
//         <p><strong>Ngày thực hiện:</strong> {task.scheduled_date}</p>
//         <p><strong>Dịch vụ:</strong> {task.services}</p>
//         <p><strong>Ghi chú:</strong> {task.description}</p>

//         <div className="mt-6 flex gap-4">
//           <button
//             onClick={start}
//             className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
//           >
//             Bắt đầu công việc
//           </button>

//           <button
//             onClick={complete}
//             className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
//           >
//             Hoàn thành
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


// client/src/pages/Staff/VisitDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/api";

export default function VisitDetail() {
  const { id } = useParams(); // id chính là order_id
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/staff/tasks/${id}`);
      setTask(res.data);
    } catch (err) {
      console.error("load visit detail error", err);
      setTask(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  if (loading) return <p>Đang tải...</p>;
  if (!task) return <p>Không tìm thấy công việc.</p>;

  // --- Actions theo backend hiện tại ---
  const move = async () => {
    await api.put(`/staff/orders/${id}/move`);
    load();
  };

  const startCare = async () => {
    await api.put(`/staff/orders/${id}/care`);
    load();
  };

  const complete = async () => {
    await api.put(`/staff/orders/${id}/complete`);
    load();
  };

  // status có thể là english hoặc vietnamese tuỳ bạn lưu DB
  const status = task.status;

  const canMove =
    status === "accepted" ||
    status === "Đã nhận" ||
    status === "confirmed";

  const canCare =
    status === "moving" ||
    status === "Đang di chuyển";

  const canComplete =
    status === "caring" ||
    status === "Đang chăm";

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-6">
        Chi tiết công việc #{id}
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-lg space-y-2">
        <p><strong>Khách hàng:</strong> {task.customer_name}</p>
        <p><strong>Số điện thoại:</strong> {task.customer_phone || "—"}</p>
        <p><strong>Địa chỉ:</strong> {task.address}</p>
        <p><strong>Ngày thực hiện:</strong> {task.scheduled_date}</p>
        <p><strong>Dịch vụ:</strong> {task.services}</p>
        <p><strong>Ghi chú:</strong> {task.description || "—"}</p>
        <p>
          <strong>Trạng thái:</strong>{" "}
          <span className="text-green-700 font-semibold">{status}</span>
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {canMove && (
            <button
              onClick={move}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Di chuyển
            </button>
          )}

          {canCare && (
            <button
              onClick={startCare}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Bắt đầu chăm
            </button>
          )}

          {canComplete && (
            <button
              onClick={complete}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
            >
              Hoàn thành đơn
            </button>
          )}

          {/* fallback nếu status lạ */}
          {!canMove && !canCare && !canComplete && status !== "completed" && status !== "Hoàn tất" && (
            <p className="text-sm text-gray-500">
              Hiện chưa có hành động phù hợp cho trạng thái này.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
