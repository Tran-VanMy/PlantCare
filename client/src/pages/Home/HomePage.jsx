// client/src/pages/Home/HomePage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api";
import Modal from "../../components/ui/Modal";
import BookingModal from "../../components/common/BookingModal";

export default function HomePage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false); // login modal fallback
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingSingle, setBookingSingle] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // Lấy danh sách dịch vụ từ backend
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await api.get("/services");
        if (!cancelled) setServices(res.data.services || []);
      } catch (err) {
        console.error("failed load services", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleBook(service) {
    const token = localStorage.getItem("token");
    if (!token) {
      setModalOpen(true);
      return;
    }
    // Open booking modal for single service
    setBookingSingle(service);
    setBookingOpen(true);
  }

  function handleBookNow() {
    const token = localStorage.getItem("token");
    if (!token) {
      setModalOpen(true);
      return;
    }
    setBookingSingle(null);
    setBookingOpen(true);
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      {/* Header */}
      <header className="flex justify-between items-center p-6 bg-green-50 shadow">
        <h1 className="text-2xl font-bold text-green-700">PlantCare</h1>
        <nav className="flex gap-6">
          <a href="#home" className="hover:text-green-600">Home</a>
          <a href="#services" className="hover:text-green-600">Services</a>
          <a href="#contact" className="hover:text-green-600">Contact</a>
          <Link to="/login" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Login</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" className="flex flex-col md:flex-row items-center justify-between p-10 bg-white">
        <div className="max-w-lg">
          <h2 className="text-4xl font-bold mb-4">Plant Care Service at Your Home</h2>
          <p className="text-gray-600 mb-6">
            We provide professional plant care at your doorstep. From pruning to pest control, we help your plants stay healthy.
          </p>
          <button onClick={handleBookNow} className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700">Book Now</button>
        </div>
        <img src="/images/plant-hero.jpg" alt="Plant Care" className="w-96 rounded-lg shadow-lg mt-6 md:mt-0" />
      </section>

      {/* Services Section */}
      <section id="services" className="py-10 bg-green-50 relative">
        <h3 className="text-center text-2xl font-bold mb-8">Our Services</h3>

        {loading ? (
          <p className="text-center text-gray-500">Loading services...</p>
        ) : (
          <div className="relative flex items-center justify-center">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(prev - 5, 0))}
              disabled={currentIndex === 0}
              className={`absolute left-4 z-10 bg-white shadow-lg rounded-full p-3 text-green-600 hover:bg-green-100 transition ${currentIndex === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              ‹
            </button>

            <div className="flex overflow-hidden gap-6">
              {services.slice(currentIndex, currentIndex + 5).map((s) => (
                <div key={s.id} className="bg-white p-6 rounded-lg shadow hover:scale-105 transition w-64">
                  <div className="w-full h-40 mb-4 overflow-hidden rounded">
                    <img src={s.image_url || "https://via.placeholder.com/400x300"} alt={s.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-lg font-semibold">{s.name}</h4>
                  <p className="text-gray-600 text-sm mb-2">{s.description?.slice(0, 80) || "No description."}</p>
                  <p className="text-green-600 font-medium">${s.price}</p>
                  <p className="text-xs text-gray-500">{s.duration_minutes} minutes</p>
                  <button onClick={() => handleBook(s)} className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">Book</button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setCurrentIndex((prev) => Math.min(prev + 5, services.length - 5))}
              disabled={currentIndex >= services.length - 5}
              className={`absolute right-4 z-10 bg-white shadow-lg rounded-full p-3 text-green-600 hover:bg-green-100 transition ${currentIndex >= services.length - 5 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              ›
            </button>
          </div>
        )}
      </section>

      {/* Contact Section (was Schedule a Visit) */}
      <section className="p-10 bg-white" id="contact">
        <h3 className="text-2xl font-bold mb-6 text-center">Contact</h3>
        <div className="max-w-2xl mx-auto bg-green-50 p-6 rounded-lg">
          <p className="mb-2">Bạn cần hỗ trợ? Liên hệ với chúng tôi:</p>
          <p><strong>Email:</strong> support@plantcare.example</p>
          <p><strong>Phone:</strong> +84 123 456 789</p>
          <p><strong>Address:</strong> 123 Plant St, Green City</p>
          <p className="mt-4 text-sm text-gray-600">Hoặc sử dụng form đặt lịch ở trên để chúng tôi liên hệ lại.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-4 bg-green-100 text-gray-600">
        © 2025 PlantCare. All rights reserved.
      </footer>

      {/* Modal yêu cầu đăng nhập */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Vui lòng đăng nhập">
        <div>
          <p>Bạn cần đăng nhập hoặc đăng ký để đặt dịch vụ.</p>
          <div className="mt-4 flex gap-3 justify-end">
            <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded">Đăng nhập</Link>
            <Link to="/register" className="px-4 py-2 bg-gray-200 rounded">Đăng ký</Link>
          </div>
        </div>
      </Modal>

      {/* Booking modal (shared) */}
      <BookingModal
        isOpen={bookingOpen}
        onClose={() => { setBookingOpen(false); setBookingSingle(null); }}
        services={services}
        singleService={bookingSingle}
      />
    </div>
  );
}
