// client/src/pages/Home/HomePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api";
import Modal from "../../components/ui/Modal";
import BookingModal from "../../components/common/BookingModal";
import ScrollToTopButton from "../../components/ui/ScrollToTopButton";
import { motion } from "framer-motion";

import roundPresets from "../../assets/round-plant/presets.json";
import servicePresets from "../../assets/services-plant/presets.json";

export default function HomePage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingSingle, setBookingSingle] = useState(null);

  // ✅ revert về logic cũ (UI-only) để Prev/Next hoạt động như bản bạn đưa
  const PAGE_SIZE = 4;
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
        if (!cancelled) {
          const list = res?.data?.services || [];
          setServices(Array.isArray(list) ? list : []);
          // ✅ UI-only: reset index khi data đổi để tránh slice rỗng
          setCurrentIndex(0);
        }
      } catch (err) {
        console.error("failed load services", err);
        if (!cancelled) {
          setServices([]);
          setCurrentIndex(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => (cancelled = true);
  }, []);

  // ✅ Reveal-on-scroll animations (UI only) — lấy từ code 2
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("opacity-100", "translate-y-0");
            e.target.classList.remove("opacity-0", "translate-y-6");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    els.forEach((el) => {
      el.classList.add(
        "opacity-0",
        "translate-y-6",
        "transition-all",
        "duration-700",
        "ease-out",
        "will-change-transform"
      );
      obs.observe(el);
    });

    return () => obs.disconnect();
  }, [loading, services.length]); // UI-only dependency

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
      m[idx + 1] = `/assets/services-plant/${img}`;
    });
    return m;
  }, []);

  // ✅ UI-only clamp giống bản cũ nhưng an toàn hơn
  const maxIndex = Math.max(0, services.length - PAGE_SIZE);
  const canPrev = currentIndex > 0;
  const canNext = currentIndex < maxIndex;

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - PAGE_SIZE, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + PAGE_SIZE, maxIndex));
  };

  // motion variants (UI only)
  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };

  // ✅ Hover spring nhanh, mượt (fix cảm giác chậm/giật)
  const fastHover = {
    type: "spring",
    stiffness: 520,
    damping: 28,
    mass: 0.6,
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gradient-to-b from-white via-emerald-50/40 to-green-100/60">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-emerald-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-emerald-700 hover:text-emerald-800 transition"
          >
            <span className="inline-flex h-9 w-9 rounded-xl bg-emerald-700 text-white items-center justify-center shadow-md shadow-emerald-700/30">
              🌿
            </span>
            PlantCare
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-gray-700 font-semibold">
            <a href="#home" className="hover:text-emerald-700 transition">Home</a>
            <a href="#services" className="hover:text-emerald-700 transition">Services</a>
            <a href="#contact" className="hover:text-emerald-700 transition">Contact</a>
          </nav>

          <div className="md:hidden text-sm font-semibold text-emerald-700">
            PlantCare
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.22),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 grid md:grid-cols-2 gap-10 items-center relative">
          {/* Left */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-sm font-semibold shadow-sm"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              Professional Home Plant Care
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900"
            >
              Plant Care Service{" "}
              <span className="text-emerald-700 drop-shadow-sm">
                at Your Home
              </span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="text-gray-700 text-lg leading-relaxed"
            >
              We provide professional plant care at your doorstep. From pruning to pest control,
              we help your plants stay healthy and thriving.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <button
                onClick={handleBookNow}
                className="
                  px-6 py-3 rounded-xl
                  bg-emerald-700 text-white font-semibold
                  shadow-lg shadow-emerald-700/30
                  hover:bg-emerald-800 hover:shadow-xl
                  active:scale-[0.98]
                  transition-all duration-300
                "
              >
                Book Now
              </button>

              <a
                href="#services"
                className="
                  px-6 py-3 rounded-xl
                  bg-white border border-emerald-200
                  text-emerald-800 font-semibold
                  hover:bg-emerald-50 hover:border-emerald-300
                  active:scale-[0.98]
                  transition-all duration-300 shadow-sm
                "
              >
                View Services
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={stagger}
              className="grid grid-cols-3 gap-4 pt-4 max-w-md"
            >
              {[
                { value: "250+", label: "Happy Clients" },
                { value: "20+", label: "Services" },
                { value: "4.9★", label: "Rating" },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={fastHover}
                  className="
                    bg-white rounded-2xl p-4
                    shadow-md border border-emerald-100
                    transition transform-gpu will-change-transform
                  "
                >
                  <div className="text-2xl font-extrabold text-gray-900">
                    {item.value}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {item.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Slider */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-center justify-center"
          >
            <div className="relative w-full max-w-md h-80 md:h-96 overflow-hidden rounded-3xl shadow-2xl border border-emerald-200 bg-white">
              <div
                className="flex h-full transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${heroIndex * 100}%)` }}
              >
                {heroImages.map((img) => (
                  <img
                    key={img}
                    src={`/assets/round-plant/${img}`}
                    alt="Plant"
                    className="w-full h-full object-cover flex-shrink-0"
                  />
                ))}
              </div>

              {/* dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {heroImages.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                      i === heroIndex
                        ? "bg-emerald-700 w-7 shadow-sm"
                        : "bg-white/90"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services — ✅ UI + animation thay bằng bản code 2, logic giữ nguyên */}
      <section
        id="services"
        className="py-12 md:py-16 bg-emerald-50/70 border-t border-emerald-100"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div data-reveal className="flex items-end justify-between gap-4 mb-8">
            <div>
              <h3 className="text-3xl font-extrabold text-gray-900">
                Our Services
              </h3>
              <p className="text-gray-700 mt-2">
                Choose the best care package for your plants.
              </p>
            </div>

            {/* Desktop Prev/Next — UI code 2, nhưng gọi handler code 1 */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={!canPrev}
                className={`rounded-xl px-4 py-2 bg-white border-2 border-emerald-200 shadow-sm text-emerald-800 font-semibold hover:bg-emerald-100 transition active:scale-95 ${
                  !canPrev ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                ‹ Prev
              </button>
              <button
                onClick={handleNext}
                disabled={!canNext}
                className={`rounded-xl px-4 py-2 bg-emerald-700 text-white shadow font-semibold hover:bg-emerald-800 transition active:scale-95 ${
                  !canNext ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Next ›
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-gray-500 py-10">
              Loading services...
            </div>
          ) : (
            <div data-reveal className="relative">
              {/* Mobile left arrow — UI code 2, nhưng gọi handler code 1 */}
              <button
                onClick={handlePrev}
                disabled={!canPrev}
                className={`md:hidden absolute -left-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 text-emerald-800 hover:bg-emerald-100 transition active:scale-95 ${
                  !canPrev ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                ‹
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {services.slice(currentIndex, currentIndex + PAGE_SIZE).map((s) => (
                  <div
                    key={s.id}
                    className="group bg-white p-4 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-[380px] border border-emerald-100 hover:-translate-y-1"
                  >
                    <div className="w-full h-48 mb-4 overflow-hidden rounded-2xl bg-gray-100">
                      <img
                        src={serviceImageMap[s.id] || s.image_url}
                        alt={s.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                      />
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-lg font-bold text-gray-900 line-clamp-1">
                        {s.name}
                      </h4>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {s.description}
                      </p>
                    </div>

                    <div className="mt-auto pt-3">
                      <div className="flex items-center justify-between">
                        <p className="text-emerald-700 font-extrabold text-lg">
                          ${s.price}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">
                          {s.duration_minutes} mins
                        </p>
                      </div>

                      <button
                        onClick={() => handleBook(s)}
                        className="mt-3 w-full bg-emerald-700 text-white py-2.5 rounded-xl font-semibold shadow hover:bg-emerald-800 hover:shadow-md transition active:scale-95"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile right arrow — UI code 2, nhưng gọi handler code 1 */}
              <button
                onClick={handleNext}
                disabled={!canNext}
                className={`md:hidden absolute -right-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 text-emerald-800 hover:bg-emerald-100 transition active:scale-95 ${
                  !canNext ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Contact */}
      <section className="py-12 md:py-16 bg-white" id="contact">
        <div className="max-w-5xl mx-auto px-6">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-extrabold mb-8 text-center text-gray-900"
          >
            Contact
          </motion.h3>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              { icon: "📧", title: "Email", content: "support@plantcare.example" },
              { icon: "📞", title: "Phone", content: "+84 123 456 789" },
              { icon: "📍", title: "Address", content: "123 Plant St, Green City" },
            ].map((c, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                transition={fastHover}
                className="
                  bg-emerald-50 p-6 rounded-2xl
                  border border-emerald-200 shadow-md
                  hover:shadow-xl transition-all duration-200
                  transform-gpu will-change-transform
                "
              >
                <div className="text-2xl">{c.icon}</div>
                <div className="font-bold mt-2 text-gray-900">{c.title}</div>
                <div className="text-gray-700 text-sm mt-1 font-medium">
                  {c.content}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Modal login */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Vui lòng đăng nhập"
      >
        <div>
          <p>Bạn cần đăng nhập hoặc đăng ký để đặt dịch vụ.</p>
          <div className="mt-4 flex gap-3 justify-end">
            <Link
              to="/login"
              className="px-4 py-2 bg-emerald-700 text-white rounded-lg shadow hover:bg-emerald-800 transition active:scale-95"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition active:scale-95"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </Modal>

      <BookingModal
        isOpen={bookingOpen}
        onClose={() => {
          setBookingOpen(false);
          setBookingSingle(null);
        }}
        services={services}
        singleService={bookingSingle}
      />

      {/* Scroll to top */}
      <ScrollToTopButton />
    </div>
  );
}
