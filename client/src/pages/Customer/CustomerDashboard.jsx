// client/src/pages/Customer/CustomerDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../../api/api";
import AddPlantModal from "../../components/common/AddPlantModal";
import ScrollToTopButton from "../../components/ui/ScrollToTopButton";
import Modal from "../../components/ui/Modal";
import SortSearchFilterBar from "../../components/common/SortSearchFilterBar";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomerDashboard() {
  const location = useLocation(); // ✅ NEW: đọc state từ navigate
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ plants: 0, orders: 0, totalSpent: 0 });
  const [orders, setOrders] = useState([]);
  const [showAddPlant, setShowAddPlant] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // sort/search/filter states
  const [sortBy, setSortBy] = useState("newest");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = async (customerId) => {
    const plantsRes = await api.get(`/customers/${customerId}/plants`);
    const plantsCount = Array.isArray(plantsRes.data)
      ? plantsRes.data.length
      : 0;

    const ordersRes = await api.get(`/customers/${customerId}/orders`);
    const list = Array.isArray(ordersRes.data) ? ordersRes.data : [];

    const ordersCount = list.length;
    const totalSpent = list.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    setStats({ plants: plantsCount, orders: ordersCount, totalSpent });
    setOrders(list);
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) return;
    setUser(storedUser);
    fetchData(storedUser.id).catch(console.error);

    // ✅ auto refresh để sync realtime (req9,11,13,14,19)
    const interval = setInterval(() => {
      fetchData(storedUser.id).catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // ✅ NEW: tự động mở AddPlantModal nếu được điều hướng từ BookingModal
  useEffect(() => {
    if (location.state?.openAddPlantModal) {
      setShowAddPlant(true);
      // Không bắt buộc, nhưng giúp tránh mở lại nếu user F5:
      // window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const cancelOrder = async (id) => {
    if (!confirm("Bạn chắc chắn muốn hủy đơn này?")) return;
    await api.put(`/orders/${id}/cancel`);
    fetchData(user.id);
  };

  const refreshPlants = async () => {
    if (!user) return;
    const res = await api.get(`/customers/${user.id}/plants`);
    const cnt = Array.isArray(res.data) ? res.data.length : 0;
    setStats((s) => ({ ...s, plants: cnt }));
  };

  const statusOptions = useMemo(() => {
    const set = new Set(orders.map((o) => o.status));
    return Array.from(set);
  }, [orders]);

  const filteredSortedOrders = useMemo(() => {
    let list = [...orders];

    // filter status
    if (statusFilter !== "all") {
      list = list.filter(
        (o) =>
          (o.status || "").toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // search by (mã đơn/tên dịch vụ/cây/địa chỉ/sdt)
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((o) => {
        return (
          String(o.id).includes(q) ||
          (o.service || "").toLowerCase().includes(q) ||
          (o.plant || "").toLowerCase().includes(q) ||
          (o.address || "").toLowerCase().includes(q) ||
          (o.phone || "").toLowerCase().includes(q)
        );
      });
    }

    // sort
    const getDate = (o) =>
      new Date(o.date || o.scheduled_date || o.created_at || 0).getTime();
    const getTotal = (o) => Number(o.total || o.total_price || 0);
    const getService = (o) => (o.service || "").toLowerCase();

    switch (sortBy) {
      case "date_asc":
        list.sort((a, b) => getDate(a) - getDate(b));
        break;
      case "date_desc":
        list.sort((a, b) => getDate(b) - getDate(a));
        break;
      case "id_asc":
        list.sort((a, b) => a.id - b.id);
        break;
      case "id_desc":
        list.sort((a, b) => b.id - a.id);
        break;
      case "service_asc":
        list.sort((a, b) => getService(a).localeCompare(getService(b)));
        break;
      case "service_desc":
        list.sort((a, b) => getService(b).localeCompare(getService(a)));
        break;
      case "total_asc":
        list.sort((a, b) => getTotal(a) - getTotal(b));
        break;
      case "total_desc":
        list.sort((a, b) => getTotal(b) - getTotal(a));
        break;
      case "oldest":
        list.sort((a, b) => getDate(a) - getDate(b));
        break;
      case "newest":
      default:
        list.sort((a, b) => getDate(b) - getDate(a));
        break;
    }

    return list;
  }, [orders, sortBy, search, statusFilter]);

  if (!user) return <p>Đang tải dữ liệu...</p>;

  // motion variants (UI only)
  const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: "easeOut" },
    },
  };

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
  };

  const shouldScroll = filteredSortedOrders.length > 10;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-emerald-100/70 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header greeting */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="mb-8"
        >
          <motion.h1
            variants={fadeUp}
            className="text-3xl md:text-4xl font-extrabold text-emerald-900 mb-2 flex items-center gap-2"
          >
            Xin chào, {user.full_name || user.name}
            <span className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-emerald-700 text-white shadow-md shadow-emerald-700/30">
              🌿
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-gray-700 font-medium">
            Chúc bạn một ngày xanh mát cùng PlantCare!
          </motion.p>
        </motion.div>

        {/* Stats cards */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
        >
          <Stat label="Cây của bạn" value={stats.plants} icon="🌱" />
          <Stat label="Tổng đơn hàng" value={stats.orders} icon="🧾" />
          <Stat
            label="Tổng chi tiêu ($)"
            value={Number(stats.totalSpent).toFixed(2)}
            icon="💰"
          />
        </motion.div>

        {/* Orders section */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white/90 backdrop-blur rounded-2xl shadow-lg shadow-emerald-900/5 p-6 mb-6 border border-emerald-100"
        >
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="text-xl font-extrabold text-emerald-900 flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-emerald-700 text-white inline-flex items-center justify-center shadow-sm">
                📦
              </span>
              Đơn hàng của bạn
            </h2>

            <div className="text-sm text-gray-600 font-semibold">
              {filteredSortedOrders.length} đơn
            </div>
          </div>

          <SortSearchFilterBar
            sortValue={sortBy}
            onSortChange={setSortBy}
            searchValue={search}
            onSearchChange={setSearch}
            statusValue={statusFilter}
            onStatusChange={setStatusFilter}
            statusOptions={statusOptions}
            searchPlaceholder="Tìm theo mã đơn / dịch vụ / cây / địa chỉ / SĐT"
          />

          {filteredSortedOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="text-gray-600 mt-4 bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-sm font-medium"
            >
              Không có đơn phù hợp.
            </motion.div>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-xl border border-emerald-100 bg-white">
              {/* ✅ Scroll only when > 10 orders */}
              <div
                className={
                  shouldScroll
                    ? "max-h-[520px] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-transparent"
                    : ""
                }
              >
                <table className="min-w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-emerald-100 text-left text-emerald-950 text-sm">
                      <th className="p-3 font-bold">Mã đơn</th>
                      <th className="p-3 font-bold">Dịch vụ</th>
                      <th className="p-3 font-bold">Cây</th>
                      <th className="p-3 font-bold">Ngày hẹn</th>
                      <th className="p-3 font-bold">Địa chỉ</th>
                      <th className="p-3 font-bold">SĐT</th>
                      <th className="p-3 font-bold">Tổng ($)</th>
                      <th className="p-3 font-bold">Trạng thái</th>
                      <th className="p-3 font-bold text-center">Chi tiết</th>
                      <th className="p-3 font-bold text-center">Hủy đơn</th>
                    </tr>
                  </thead>

                  <tbody>
                    <AnimatePresence initial={false}>
                      {filteredSortedOrders.map((o) => (
                        <motion.tr
                          key={o.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          whileHover={{
                            backgroundColor: "rgba(16,185,129,0.06)",
                          }}
                          className="border-b last:border-b-0 text-sm"
                        >
                          <td className="p-3 font-semibold text-gray-900 whitespace-nowrap">
                            #{o.id}
                          </td>
                          <td className="p-3 text-gray-800">{o.service}</td>
                          <td className="p-3 text-gray-800">{o.plant}</td>
                          <td className="p-3 text-gray-700 whitespace-nowrap">
                            {new Date(o.date).toLocaleString()}
                          </td>
                          <td className="p-3 text-gray-700">{o.address}</td>
                          <td className="p-3 text-gray-700">
                            {o.phone || "—"}
                          </td>
                          <td className="p-3 font-bold text-emerald-800">
                            {Number(o.total).toFixed(2)}
                          </td>

                          <td className="p-3">
                            <StatusPill status={o.status} />
                          </td>

                          <td className="p-3 text-center">
                            <button
                              onClick={() => setSelectedOrder(o)}
                              className="
                                px-3 py-1.5 rounded-lg text-white text-xs font-bold
                                bg-sky-600 shadow-sm shadow-sky-600/20
                                hover:bg-sky-700 hover:shadow-md
                                active:scale-[0.97]
                                transition-all duration-200
                              "
                            >
                              Chi tiết
                            </button>
                          </td>

                          <td className="p-3 text-center">
                            {o.status === "Chờ xác nhận" ? (
                              <button
                                onClick={() => cancelOrder(o.id)}
                                className="
                                  px-3 py-1.5 rounded-lg text-white text-xs font-bold
                                  bg-rose-600 shadow-sm shadow-rose-600/20
                                  hover:bg-rose-700 hover:shadow-md
                                  active:scale-[0.97]
                                  transition-all duration-200
                                "
                              >
                                Hủy
                              </button>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {shouldScroll && (
                <div className="px-4 py-2 text-xs font-semibold text-gray-600 border-t border-emerald-100 bg-white">
                  Có nhiều hơn 10 đơn — bạn có thể cuộn để xem thêm ⬇️
                </div>
              )}
            </div>
          )}
        </motion.section>

        {/* Action buttons */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="mt-8 flex flex-wrap gap-3"
        >
          <motion.div variants={fadeUp}>
            <Link
              to="/customer/my-plants"
              className="
                inline-flex items-center gap-2
                bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold
                shadow-md shadow-emerald-700/25
                hover:bg-emerald-800 hover:shadow-lg
                active:scale-[0.98]
                transition-all duration-300
              "
            >
              🌱 Quản lý cây
            </Link>
          </motion.div>

          <motion.div variants={fadeUp}>
            <button
              onClick={() => setShowAddPlant(true)}
              className="
                inline-flex items-center gap-2
                bg-sky-600 text-white px-6 py-2.5 rounded-xl font-semibold
                shadow-md shadow-sky-600/25
                hover:bg-sky-700 hover:shadow-lg
                active:scale-[0.98]
                transition-all duration-300
              "
            >
              ➕ Thêm cây
            </button>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Link
              to="/customer/orders"
              className="
                inline-flex items-center gap-2
                bg-white border border-gray-200 px-6 py-2.5 rounded-xl font-semibold text-gray-800
                shadow-sm hover:bg-gray-50 hover:border-gray-300
                active:scale-[0.98]
                transition-all duration-300
              "
            >
              🧾 Lịch sử đơn hàng
            </Link>
          </motion.div>
        </motion.div>

        {/* ✅ Enhanced Order detail modal */}
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Chi tiết đơn #${selectedOrder?.id}`}
        >
          <AnimatePresence mode="wait">
            {selectedOrder && (
              <motion.div
                key={selectedOrder.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="space-y-4 text-sm"
              >
                {/* Top summary */}
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm">
                      📦
                    </span>
                    <div>
                      <div className="text-base font-extrabold text-emerald-900">
                        Đơn #{selectedOrder.id}
                      </div>
                      <div className="text-xs font-semibold text-gray-600">
                        {new Date(selectedOrder.date).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <StatusPill status={selectedOrder.status} />
                    <div className="mt-1 text-lg font-extrabold text-emerald-800">
                      ${Number(selectedOrder.total).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Customer name */}
                <div className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
                  <div className="text-xs font-bold text-gray-600 flex items-center gap-1">
                    👤 Tên khách hàng
                  </div>
                  <div className="mt-1 font-semibold text-gray-900">
                    {selectedOrder.customer_name || "—"}
                  </div>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoCard
                    icon="🛠️"
                    label="Dịch vụ"
                    value={selectedOrder.service || "—"}
                  />
                  <InfoCard
                    icon="🌿"
                    label="Cây"
                    value={selectedOrder.plant || "—"}
                  />
                  <InfoCard
                    icon="📍"
                    label="Địa chỉ"
                    value={selectedOrder.address || "—"}
                  />
                  <InfoCard
                    icon="📞"
                    label="SĐT"
                    value={selectedOrder.phone || "—"}
                  />
                </div>

                {/* Voucher + Note */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
                    <div className="text-xs font-bold text-gray-600 flex items-center gap-1">
                      🎟️ Voucher
                    </div>
                    <div className="mt-1 font-semibold text-gray-900">
                      {selectedOrder.voucher_code || "—"}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
                    <div className="text-xs font-bold text-gray-600 flex items-center gap-1">
                      📝 Ghi chú
                    </div>
                    <div className="mt-1 font-semibold text-gray-900 whitespace-pre-wrap">
                      {selectedOrder.note || "—"}
                    </div>
                  </div>
                </div>

                {selectedOrder.status === "Chờ xác nhận" && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-900 text-xs font-semibold">
                    ⏳ Đơn của bạn đang chờ xác nhận. Bạn vẫn có thể hủy nếu cần.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Modal>

        <AddPlantModal
          isOpen={showAddPlant}
          onClose={() => setShowAddPlant(false)}
          onAdded={() => refreshPlants()}
        />
      </div>

      <ScrollToTopButton />
    </div>
  );
}

/* ---------- UI-only components ---------- */

function Stat({ label, value, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="
        bg-white p-6 rounded-2xl shadow-md shadow-emerald-900/5
        text-center border border-emerald-100
      "
    >
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-sm text-gray-600 font-semibold">{label}</p>
      <p className="text-3xl font-extrabold text-emerald-800 mt-1">{value}</p>
    </motion.div>
  );
}

function StatusPill({ status }) {
  const s = (status || "").toLowerCase();

  let cls = "bg-gray-100 text-gray-700 border-gray-200";
  if (s.includes("chờ") || s.includes("pending"))
    cls = "bg-amber-50 text-amber-800 border-amber-200";
  if (s.includes("đang") || s.includes("processing"))
    cls = "bg-sky-50 text-sky-800 border-sky-200";
  if (s.includes("hoàn") || s.includes("done") || s.includes("completed"))
    cls = "bg-emerald-50 text-emerald-800 border-emerald-200";
  if (s.includes("hủy") || s.includes("cancel"))
    cls = "bg-rose-50 text-rose-800 border-rose-200";

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border
        ${cls}
      `}
    >
      {status}
    </span>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition">
      <div className="text-xs font-bold text-gray-600 flex items-center gap-1">
        <span>{icon}</span> {label}
      </div>
      <div className="mt-1 font-semibold text-gray-900">{value}</div>
    </div>
  );
}
