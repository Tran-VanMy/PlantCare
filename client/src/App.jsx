// frontend/src/App.js
import { Routes, Route, Navigate } from "react-router-dom";

// 🏠 Public pages
import HomePage from "./pages/Home/HomePage";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";

// 👤 Customer pages
import CustomerDashboard from "./pages/Customer/CustomerDashboard";
import MyPlants from "./pages/Customer/MyPlants";
import OrderHistory from "./pages/Customer/OrderHistory";

// 👷 Staff pages
import StaffDashboard from "./pages/Staff/StaffDashboard";
import TaskList from "./pages/Staff/TaskList";
import VisitDetail from "./pages/Staff/VisitDetail";

// 🧑‍💼 Admin pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import UsersManagement from "./pages/Admin/UsersManagement";
import ServicesManagement from "./pages/Admin/ServicesManagement";
import OrdersManagement from "./pages/Admin/OrdersManagement";

// ⚙️ Common components
import PrivateRoute from "./components/common/PrivateRoute";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <Header />

      <main className="flex-grow p-4">
        <Routes>
          {/* 🌿 Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* 👤 Customer routes */}
          <Route
            path="/customer/dashboard"
            element={
              <PrivateRoute role="customer">
                <CustomerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/customer/my-plants"
            element={
              <PrivateRoute role="customer">
                <MyPlants />
              </PrivateRoute>
            }
          />
          <Route
            path="/customer/orders"
            element={
              <PrivateRoute role="customer">
                <OrderHistory />
              </PrivateRoute>
            }
          />

          {/* 👷 Staff routes */}
          <Route
            path="/staff/dashboard"
            element={
              <PrivateRoute role="staff">
                <StaffDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/staff/tasks"
            element={
              <PrivateRoute role="staff">
                <TaskList />
              </PrivateRoute>
            }
          />
          <Route
            path="/staff/visit/:id"
            element={
              <PrivateRoute role="staff">
                <VisitDetail />
              </PrivateRoute>
            }
          />

          {/* 🧑‍💼 Admin routes */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute role="admin">
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute role="admin">
                <UsersManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/services"
            element={
              <PrivateRoute role="admin">
                <ServicesManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <PrivateRoute role="admin">
                <OrdersManagement />
              </PrivateRoute>
            }
          />

          {/* 🧭 Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
