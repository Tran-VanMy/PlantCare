import { useEffect, useState } from "react";
import api from "../../api/api";
import Modal from "../../components/ui/Modal";

export default function MyPlants() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlant, setSelectedPlant] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) return;

    const fetchPlants = async () => {
      try {
        const res = await api.get(`/customers/${storedUser.id}/plants`);
        setPlants(res.data);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách cây:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  if (loading) return <p>Đang tải dữ liệu cây...</p>;
  if (plants.length === 0) return <p>Bạn chưa có cây nào.</p>;

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-6">🌱 Cây của bạn</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {plants.map((plant) => (
          <div key={plant.id} className="bg-white p-4 rounded-xl shadow">
            <h3 className="text-lg font-semibold">{plant.name}</h3>
            <p>Loại: {plant.type || "—"}</p>
            <p>Ngày thêm: {new Date(plant.created_at).toLocaleDateString()}</p>
            <button
              onClick={() => setSelectedPlant(plant)}
              className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              Xem chi tiết
            </button>
          </div>
        ))}
      </div>

      <Modal
        isOpen={!!selectedPlant}
        onClose={() => setSelectedPlant(null)}
        title="Chi tiết cây"
      >
        {selectedPlant && (
          <div className="space-y-2">
            <p><strong>Tên:</strong> {selectedPlant.name}</p>
            <p><strong>Loại:</strong> {selectedPlant.type || "—"}</p>
            <p><strong>Ngày:</strong> {new Date(selectedPlant.created_at).toLocaleString()}</p>
            <p><strong>Vị trí:</strong> {selectedPlant.location || "—"}</p>
            <p><strong>Mô tả:</strong> {selectedPlant.description || "—"}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
