// export default function ServicesManagement() {
//   const services = [
//     { id: 1, name: "Tưới cây", price: 10 },
//     { id: 2, name: "Cắt tỉa", price: 15 },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <h1 className="text-2xl font-bold text-green-700 mb-6">Quản lý dịch vụ</h1>
//       <table className="min-w-full bg-white rounded-lg shadow">
//         <thead>
//           <tr className="bg-green-100">
//             <th className="p-3 text-left">ID</th>
//             <th className="p-3 text-left">Tên dịch vụ</th>
//             <th className="p-3 text-left">Giá ($)</th>
//           </tr>
//         </thead>
//         <tbody>
//           {services.map((s) => (
//             <tr key={s.id} className="border-b hover:bg-green-50">
//               <td className="p-3">{s.id}</td>
//               <td className="p-3">{s.name}</td>
//               <td className="p-3">{s.price}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

















import { useEffect, useState } from "react";
import api from "../../api/api";

export default function ServicesManagement() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    api.get("/admin/services")
      .then((res) => setServices(res.data))
      .catch((err) => console.error("Failed to load services:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-6">Quản lý dịch vụ</h1>

      <table className="min-w-full bg-white rounded-lg shadow">
        <thead>
          <tr className="bg-green-100">
            <th className="p-3">ID</th>
            <th className="p-3">Tên dịch vụ</th>
            <th className="p-3">Giá ($)</th>
          </tr>
        </thead>
        <tbody>
          {services.map((s) => (
            <tr key={s.id} className="border-b hover:bg-green-50">
              <td className="p-3">{s.id}</td>
              <td className="p-3">{s.name}</td>
              <td className="p-3">{s.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
