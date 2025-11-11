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











// client/src/pages/Staff/VisitDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/api";

export default function VisitDetail() {
  const { id } = useParams();
  const [task, setTask] = useState(null);

  const load = () => {
    api.get(`/staff/tasks/${id}`).then(res => setTask(res.data)).catch(err => {
      console.error("load visit detail error", err);
      setTask(null);
    });
  };

  useEffect(() => {
    load();
  }, [id]);

  if (!task) return <p>Đang tải...</p>;

  const start = () => api.put(`/staff/tasks/${id}/start`).then(load);
  const complete = () => api.put(`/staff/tasks/${id}/complete`).then(load);

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-6">Chi tiết công việc {id}</h1>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <p><strong>Khách hàng:</strong> {task.customer_name}</p>
        <p><strong>Số điện thoại:</strong> {task.customer_phone || "—"}</p>
        <p><strong>Địa chỉ:</strong> {task.address}</p>
        <p><strong>Ngày thực hiện:</strong> {task.scheduled_date}</p>
        <p><strong>Dịch vụ:</strong> {task.services}</p>
        <p><strong>Ghi chú:</strong> {task.description}</p>

        <div className="mt-6 flex gap-4">
          <button
            onClick={start}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Bắt đầu công việc
          </button>

          <button
            onClick={complete}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Hoàn thành
          </button>
        </div>
      </div>
    </div>
  );
}
