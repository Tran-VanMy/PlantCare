export default function UsersManagement() {
  const users = [
    { id: 1, name: "Nguyễn Văn A", role: "Customer", email: "a@gmail.com" },
    { id: 2, name: "Trần Thị B", role: "Staff", email: "b@gmail.com" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-6">Quản lý người dùng</h1>
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead>
          <tr className="bg-green-100">
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Họ tên</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Vai trò</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b hover:bg-green-50">
              <td className="p-3">{u.id}</td>
              <td className="p-3">{u.name}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3">{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
