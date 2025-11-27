import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // 🌿 Menu theo role
  const renderMenu = () => {
    if (!user) return null;

    switch (user.role_id) {
      case 3: // CUSTOMER
        return (
          <nav className="flex gap-4">
            <Link to="/customer/dashboard" className="hover:text-green-600">
              Dashboard
            </Link>
            <Link to="/customer/my-plants" className="hover:text-green-600">
              My Plants
            </Link>
            <Link to="/customer/orders" className="hover:text-green-600">
              Order History
            </Link>
            <Link to="/customer/vouchers" className="hover:text-green-600">
              Voucher
            </Link>
          </nav>
        );

      case 2: // STAFF
        return (
          <nav className="flex gap-4">
            <Link to="/staff/dashboard" className="hover:text-green-600">
              Staff Dashboard
            </Link>
            <Link to="/staff/tasks" className="hover:text-green-600">
              Tasks
            </Link>
            <Link to="/staff/history" className="hover:text-green-600">
              Task History
            </Link>
          </nav>
        );

      case 1: // ADMIN
        return (
          <nav className="flex gap-4">
            <Link to="/admin/dashboard" className="hover:text-green-600">
              Admin Dashboard
            </Link>
            <Link to="/admin/users" className="hover:text-green-600">
              Users
            </Link>
            <Link to="/admin/services" className="hover:text-green-600">
              Services
            </Link>
            <Link to="/admin/orders" className="hover:text-green-600">
              Orders
            </Link>
          </nav>
        );

      default:
        return null;
    }
  };

  return (
    <header className="bg-green-50 shadow p-4 flex justify-between items-center">
      <div className="flex items-center gap-6">
        <Link
          to="/"
          className="text-2xl font-bold text-green-700 hover:text-green-800"
        >
          PlantCare
        </Link>

        {renderMenu()}
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-green-700 font-medium">
              Hi, {user.full_name || user.name}
            </span>

            {/* 👤 icon profile */}
            <button
              onClick={() => navigate("/profile")}
              title="Thông tin cá nhân"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow hover:bg-green-100"
            >
              👤
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
