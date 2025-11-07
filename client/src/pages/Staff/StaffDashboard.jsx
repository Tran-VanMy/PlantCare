import { Link } from "react-router-dom";

export default function StaffDashboard() {
  const stats = [
    { label: "Công việc hôm nay", value: 4 },
    { label: "Hoàn thành", value: 2 },
    { label: "Đang thực hiện", value: 1 },
    { label: "Chờ xử lý", value: 1 },
  ];

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-green-700">Bảng điều khiển nhân viên</h1>
        <Link to="/login" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          Đăng xuất
        </Link>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((item, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="text-2xl font-bold text-green-700">{item.value}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Danh sách công việc hôm nay</h2>
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead>
            <tr className="bg-green-100 text-left">
              <th className="p-3">Mã công việc</th>
              <th className="p-3">Khách hàng</th>
              <th className="p-3">Địa chỉ</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: "T001", name: "Nguyễn Văn A", address: "123 Trần Phú", status: "Đang làm" },
              { id: "T002", name: "Lê Thị B", address: "45 Nguyễn Huệ", status: "Chờ" },
              { id: "T003", name: "Trần C", address: "78 Lê Lợi", status: "Hoàn thành" },
            ].map((task, i) => (
              <tr key={i} className="border-b hover:bg-green-50">
                <td className="p-3">{task.id}</td>
                <td className="p-3">{task.name}</td>
                <td className="p-3">{task.address}</td>
                <td className="p-3">{task.status}</td>
                <td className="p-3 text-center">
                  <Link
                    to={`/staff/task/${task.id}`}
                    className="text-green-600 hover:underline"
                  >
                    Xem chi tiết
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
