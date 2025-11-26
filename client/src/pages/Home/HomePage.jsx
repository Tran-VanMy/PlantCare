import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api";
import Modal from "../../components/ui/Modal";
import BookingModal from "../../components/common/BookingModal";

import roundPresets from "../../assets/round-plant/presets.json";
import servicePresets from "../../assets/services-plant/presets.json";

export default function HomePage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingSingle, setBookingSingle] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // slider hero
  const [heroIndex, setHeroIndex] = useState(0);
  const heroImages = roundPresets.images;

  useEffect(() => {
    const id = setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroImages.length);
    }, 2000);
    return () => clearInterval(id);
  }, [heroImages.length]);

  const navigate = useNavigate();

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
    return () => (cancelled = true);
  }, []);

  function handleBook(service) {
    const token = localStorage.getItem("token");
    if (!token) return setModalOpen(true);
    setBookingSingle(service);
    setBookingOpen(true);
  }

  function handleBookNow() {
    const token = localStorage.getItem("token");
    if (!token) return setModalOpen(true);
    setBookingSingle(null);
    setBookingOpen(true);
  }

  const serviceImageMap = useMemo(() => {
    const m = {};
    servicePresets.images.forEach((img, idx) => {
      m[idx + 1] = `/assets/services-plant/${img}`; // public/assets/...
    });
    return m;
  }, []);

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

      {/* Hero */}
      <section id="home" className="flex flex-col md:flex-row items-center justify-between p-10 bg-white">
        <div className="max-w-lg">
          <h2 className="text-4xl font-bold mb-4">Plant Care Service at Your Home</h2>
          <p className="text-gray-600 mb-6">
            We provide professional plant care at your doorstep. From pruning to pest control, we help your plants stay healthy.
          </p>
          <button onClick={handleBookNow} className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700">
            Book Now
          </button>
        </div>

        {/* Slider ảnh trượt mượt */}
        <div className="relative w-96 h-72 overflow-hidden rounded-2xl shadow-lg mt-6 md:mt-0">
          <div
            className="flex h-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${heroIndex * 100}%)` }}
          >
            {heroImages.map((img) => (
              <img
                key={img}
                src={`/assets/round-plant/${img}`}
                alt="Plant"
                className="w-96 h-72 object-cover flex-shrink-0"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-10 bg-green-50 relative">
        <h3 className="text-center text-2xl font-bold mb-8">Our Services</h3>

        {loading ? (
          <p className="text-center text-gray-500">Loading services...</p>
        ) : (
          <div className="relative flex items-center justify-center">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(prev - 4, 0))}
              disabled={currentIndex === 0}
              className={`absolute left-4 z-10 bg-white shadow-lg rounded-full p-3 text-green-600 hover:bg-green-100 transition ${currentIndex === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              ‹
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-6xl px-10">
              {services.slice(currentIndex, currentIndex + 4).map((s) => (
                <div key={s.id} className="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition flex flex-col h-[360px]">
                  <div className="w-full h-44 mb-3 overflow-hidden rounded-xl">
                    <img
                      src={serviceImageMap[s.id] || s.image_url}
                      alt={s.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h4 className="text-lg font-semibold line-clamp-1">{s.name}</h4>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{s.description}</p>

                  <div className="mt-auto">
                    <p className="text-green-600 font-medium">${s.price}</p>
                    <p className="text-xs text-gray-500">{s.duration_minutes} minutes</p>
                    <button onClick={() => handleBook(s)} className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                      Book
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setCurrentIndex((prev) => Math.min(prev + 4, services.length - 4))}
              disabled={currentIndex >= services.length - 4}
              className={`absolute right-4 z-10 bg-white shadow-lg rounded-full p-3 text-green-600 hover:bg-green-100 transition ${currentIndex >= services.length - 4 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              ›
            </button>
          </div>
        )}
      </section>

      {/* Contact */}
      <section className="p-10 bg-white" id="contact">
        <h3 className="text-2xl font-bold mb-6 text-center">Contact</h3>
        <div className="max-w-2xl mx-auto bg-green-50 p-6 rounded-lg">
          <p className="mb-2">Bạn cần hỗ trợ? Liên hệ với chúng tôi:</p>
          <p><strong>Email:</strong> support@plantcare.example</p>
          <p><strong>Phone:</strong> +84 123 456 789</p>
          <p><strong>Address:</strong> 123 Plant St, Green City</p>
        </div>
      </section>

      <footer className="text-center py-4 bg-green-100 text-gray-600">
        © 2025 PlantCare. All rights reserved.
      </footer>

      {/* Modal login */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Vui lòng đăng nhập">
        <div>
          <p>Bạn cần đăng nhập hoặc đăng ký để đặt dịch vụ.</p>
          <div className="mt-4 flex gap-3 justify-end">
            <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded">Đăng nhập</Link>
            <Link to="/register" className="px-4 py-2 bg-gray-200 rounded">Đăng ký</Link>
          </div>
        </div>
      </Modal>

      <BookingModal
        isOpen={bookingOpen}
        onClose={() => { setBookingOpen(false); setBookingSingle(null); }}
        services={services}
        singleService={bookingSingle}
      />
    </div>
  );
}
