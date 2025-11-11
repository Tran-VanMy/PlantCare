// export default function TaskList() {
//   return (
//     <div className="min-h-screen bg-green-50 p-6">
//       <h1 className="text-2xl font-bold text-green-700 mb-6">Danh sách nhiệm vụ</h1>
//       <div className="grid gap-4">
//         {[
//           { title: "Tưới cây", customer: "Nguyễn Văn A", status: "Đang làm" },
//           { title: "Cắt tỉa", customer: "Trần Văn B", status: "Chờ xử lý" },
//         ].map((task, i) => (
//           <div key={i} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
//             <div>
//               <h3 className="text-lg font-semibold">{task.title}</h3>
//               <p className="text-gray-500">Khách hàng: {task.customer}</p>
//             </div>
//             <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
//               {task.status === "Chờ xử lý" ? "Bắt đầu" : "Hoàn thành"}
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }






















// import { useEffect, useState } from "react";
// import api from "../../api/api";

// export default function TaskList() {
//   const [tasks, setTasks] = useState([]);

//   useEffect(() => {
//     api.get("/staff/tasks").then(res => setTasks(res.data));
//   }, []);

//   return (
//     <div className="min-h-screen bg-green-50 p-6">
//       <h1 className="text-2xl font-bold text-green-700 mb-6">Danh sách nhiệm vụ</h1>

//       <div className="grid gap-4">
//         {tasks.map((task) => (
//           <div key={task.id} className="bg-white p-4 rounded-lg shadow flex justify-between">
//             <div>
//               <h3 className="text-lg font-semibold">{task.title}</h3>
//               <p className="text-gray-500">Khách hàng: {task.customer_name}</p>
//             </div>
//             <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
//               {task.status === "pending" ? "Bắt đầu" : "Hoàn thành"}
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }












// client/src/pages/Staff/TaskList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    api.get("/staff/tasks")
      .then(res => setTasks(res.data || []))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-6">Danh sách nhiệm vụ</h1>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">{task.title}</h3>
              <p className="text-gray-500">Khách hàng: {task.customer_name}</p>
              <p className="text-gray-500">SĐT: {task.customer_phone || "—"}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-sm text-gray-600">{task.status}</span>
              <Link to={`/staff/visit/${task.id}`} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Xem chi tiết
              </Link>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <p className="text-center text-gray-500">Không có nhiệm vụ.</p>
        )}
      </div>
    </div>
  );
}
