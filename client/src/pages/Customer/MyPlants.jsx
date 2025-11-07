import { useEffect, useState } from "react";
import api from "../../api/api";

// 🔹 Mock dữ liệu mẫu (sẽ bị thay thế khi backend hoạt động)
const mockPlants = [
  {
    id: 1,
    name: "Cây Lưỡi Hổ",
    type: "Cây trong nhà",
    created_at: "2025-09-12T08:00:00.000Z",
  },
  {
    id: 2,
    name: "Cây Trầu Bà",
    type: "Cây leo",
    created_at: "2025-10-01T10:30:00.000Z",
  },
  {
    id: 3,
    name: "Cây Sen Đá",
    type: "Cây để bàn",
    created_at: "2025-11-05T09:15:00.000Z",
  },
];

export default function MyPlants() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      setError("Vui lòng đăng nhập để xem danh sách cây của bạn.");
      setLoading(false);
      return;
    }

    const fetchPlants = async () => {
      try {
        // ✅ Nếu backend đã sẵn sàng, bỏ comment dòng dưới và xoá mock
        // const res = await api.get(`/customers/${storedUser.id}/plants`);
        // setPlants(res.data);

        // 🔹 Nếu chưa có backend thì dùng mock data
        await new Promise((r) => setTimeout(r, 600)); // giả lập độ trễ API
        setPlants(mockPlants);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách cây:", err);
        setError("Không thể tải danh sách cây. Vui lòng thử lại sau!");
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <p className="text-green-700 text-lg font-medium animate-pulse">
          Đang tải dữ liệu cây...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );

  if (plants.length === 0)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50">
        <p className="text-gray-700 text-lg mb-4">Bạn chưa có cây nào 🌱</p>
        <button
          onClick={() => alert("Chức năng thêm cây sẽ có trong bản sau!")}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow"
        >
          + Thêm cây mới
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <h1 className="text-3xl font-bold text-green-700 mb-8 text-center">
        🌿 Danh sách cây của bạn
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {plants.map((plant) => (
          <div
            key={plant.id}
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            <h3 className="text-xl font-semibold text-green-700 mb-2">
              {plant.name}
            </h3>
            <p className="text-gray-600">
              <span className="font-medium">Loại:</span> {plant.type}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Ngày thêm:</span>{" "}
              {new Date(plant.created_at).toLocaleDateString("vi-VN")}
            </p>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => alert(`Chi tiết cây ${plant.name} (demo)`)}
                className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
              >
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

















// import { useEffect, useState } from "react";
// import api from "../../api/api";

// export default function MyPlants() {
//   const [plants, setPlants] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const storedUser = JSON.parse(localStorage.getItem("user"));
//     if (!storedUser) return;

//     const fetchPlants = async () => {
//       try {
//         const res = await api.get(`/customers/${storedUser.id}/plants`);
//         setPlants(res.data);
//       } catch (err) {
//         console.error("Lỗi khi lấy danh sách cây:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPlants();
//   }, []);

//   if (loading) return <p>Đang tải dữ liệu cây...</p>;
//   if (plants.length === 0) return <p>Bạn chưa có cây nào.</p>;

//   return (
//     <div className="min-h-screen bg-green-50 p-6">
//       <h1 className="text-2xl font-bold text-green-700 mb-6">🌱 Cây của bạn</h1>
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//         {plants.map((plant) => (
//           <div key={plant.id} className="bg-white p-4 rounded-lg shadow">
//             <h3 className="text-lg font-semibold">{plant.name}</h3>
//             <p>Loại: {plant.type}</p>
//             <p>Ngày thêm: {new Date(plant.created_at).toLocaleDateString()}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
