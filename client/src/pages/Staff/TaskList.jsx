export default function TaskList() {
  return (
    <div className="min-h-screen bg-green-50 p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-6">Danh sách nhiệm vụ</h1>
      <div className="grid gap-4">
        {[
          { title: "Tưới cây", customer: "Nguyễn Văn A", status: "Đang làm" },
          { title: "Cắt tỉa", customer: "Trần Văn B", status: "Chờ xử lý" },
        ].map((task, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">{task.title}</h3>
              <p className="text-gray-500">Khách hàng: {task.customer}</p>
            </div>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              {task.status === "Chờ xử lý" ? "Bắt đầu" : "Hoàn thành"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
