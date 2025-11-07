import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="bg-green-50 shadow p-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-2xl font-bold text-green-700 hover:text-green-800">
          PlantCare
        </Link>
        {user && (
          <nav className="flex gap-4">
            <Link to="/customer/dashboard" className="hover:text-green-600">Dashboard</Link>
            <Link to="/customer/my-plants" className="hover:text-green-600">My Plants</Link>
            <Link to="/customer/orders" className="hover:text-green-600">Order History</Link>
          </nav>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-green-700 font-medium">Hi, {user.full_name || user.name}</span>
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
