// client/src/pages/Admin/ServicesManagement.jsx
import { useEffect, useMemo, useState } from "react";
import ScrollToTopButton from "../../components/ui/ScrollToTopButton";
import api from "../../api/api";
import { motion, AnimatePresence } from "framer-motion";

export default function ServicesManagement() {
  const [services, setServices] = useState([]);
  const [sortBy, setSortBy] = useState("id_asc");
  const [search, setSearch] = useState("");
  const [priceFilter, setPriceFilter] = useState("all"); // "all" | "lt50" | "50to100" | "gt100"

  useEffect(() => {
    api
      .get("/admin/services")
      .then((res) => setServices(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Failed to load services:", err));
  }, []);

  const filteredSorted = useMemo(() => {
    let arr = [...services];

    if (priceFilter !== "all") {
      arr = arr.filter((s) => {
        const p = Number(s.price || 0);
        if (priceFilter === "lt50") return p < 50;
        if (priceFilter === "50to100") return p >= 50 && p <= 100;
        if (priceFilter === "gt100") return p > 100;
        return true;
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (s) =>
          String(s.id).includes(q) ||
          (s.name || "").toLowerCase().includes(q) ||
          String(s.price).includes(q)
      );
    }

    const getName = (s) => (s.name || "").toLowerCase();
    const getPrice = (s) => Number(s.price || 0);

    switch (sortBy) {
      case "id_desc":
        arr.sort((a, b) => b.id - a.id);
        break;
      case "name_asc":
        arr.sort((a, b) => getName(a).localeCompare(getName(b)));
        break;
      case "name_desc":
        arr.sort((a, b) => getName(b).localeCompare(getName(a)));
        break;
      case "price_asc":
        arr.sort((a, b) => getPrice(a) - getPrice(b));
        break;
      case "price_desc":
        arr.sort((a, b) => getPrice(b) - getPrice(a));
        break;
      case "id_asc":
      default:
        arr.sort((a, b) => a.id - b.id);
        break;
    }

    return arr;
  }, [services, sortBy, search, priceFilter]);

  // ✅ yêu cầu 3: nếu > 10 dịch vụ thì bật scroll
  const enableScroll = filteredSorted.length > 10;

  // motion variants (UI only)
  const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
  };
  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/60 to-emerald-100/80 p-6">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="flex items-center justify-between flex-wrap gap-3"
        >
          <motion.h1
            variants={fadeUp}
            className="text-2xl md:text-3xl font-extrabold text-emerald-900 flex items-center gap-2"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md shadow-emerald-700/30">
              🌿
            </span>
            Quản lý dịch vụ
          </motion.h1>

          <motion.div
            variants={fadeUp}
            className="text-sm font-semibold text-emerald-900 bg-white/80 border border-emerald-200 rounded-full px-3 py-1 shadow-sm"
          >
            Tổng cộng:{" "}
            <span className="font-extrabold text-emerald-800">
              {services.length}
            </span>{" "}
            dịch vụ
          </motion.div>
        </motion.div>

        {/* Filter bar */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="bg-white rounded-2xl border border-emerald-100 shadow-lg p-3 md:p-4"
        >
          <div className="flex flex-col md:flex-row gap-3">
            {/* sort */}
            <motion.label variants={fadeUp} className="flex items-center gap-2">
              <span className="text-xl">↕️</span>
              <select
                className="
                  border border-emerald-200 p-2.5 rounded-xl bg-white
                  font-semibold text-emerald-900
                  focus:outline-none focus:ring-2 focus:ring-emerald-300
                  hover:border-emerald-300 transition
                "
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="id_asc">ID ↑</option>
                <option value="id_desc">ID ↓</option>
                <option value="name_asc">Tên dịch vụ ↑</option>
                <option value="name_desc">Tên dịch vụ ↓</option>
                <option value="price_asc">Giá ↑</option>
                <option value="price_desc">Giá ↓</option>
              </select>
            </motion.label>

            {/* search */}
            <motion.label variants={fadeUp} className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">
                🔎
              </span>
              <input
                className="
                  w-full border border-emerald-200 p-2.5 pl-10 rounded-xl
                  font-semibold text-emerald-900 placeholder:text-gray-400
                  focus:outline-none focus:ring-2 focus:ring-emerald-300
                  hover:border-emerald-300 transition
                "
                placeholder="Tìm theo ID / tên dịch vụ / giá"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </motion.label>

            {/* price filter */}
            <motion.label variants={fadeUp} className="flex items-center gap-2">
              <span className="text-xl">💰</span>
              <select
                className="
                  border border-emerald-200 p-2.5 rounded-xl bg-white
                  font-semibold text-emerald-900
                  focus:outline-none focus:ring-2 focus:ring-emerald-300
                  hover:border-emerald-300 transition
                "
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
              >
                <option value="all">Tất cả giá</option>
                <option value="lt50">&lt; 50$</option>
                <option value="50to100">50$ - 100$</option>
                <option value="gt100">&gt; 100$</option>
              </select>
            </motion.label>
          </div>
        </motion.div>

        {/* Table container */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`
            bg-white rounded-2xl border border-emerald-100 shadow-xl
            ${enableScroll ? "max-h-[560px] overflow-auto" : "overflow-hidden"}
          `}
        >
          <table className="min-w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-r from-emerald-700 via-green-600 to-lime-500 text-white">
                <th className="p-3 text-left font-extrabold">ID</th>
                <th className="p-3 text-left font-extrabold">Tên dịch vụ</th>
                <th className="p-3 text-left font-extrabold">Giá ($)</th>
              </tr>
            </thead>

            <tbody>
              <AnimatePresence initial={false}>
                {filteredSorted.map((s) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.25 }}
                    className="border-b hover:bg-emerald-50/70 transition-colors"
                  >
                    <td className="p-3 font-bold text-emerald-900">#{s.id}</td>
                    <td className="p-3 font-semibold text-gray-900">
                      {s.name}
                    </td>
                    <td className="p-3">
                      <span
                        className="
                          inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold
                          bg-emerald-50 text-emerald-900 border border-emerald-100
                        "
                      >
                        💵 {s.price}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {filteredSorted.length === 0 && (
            <div className="p-6 text-center text-gray-500 font-semibold">
              Không có dịch vụ phù hợp.
            </div>
          )}
        </motion.div>

        <ScrollToTopButton />
      </div>
    </div>
  );
}
