// client/src/pages/Admin/OrdersManagement.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import ScrollToTopButton from "../../components/ui/ScrollToTopButton";
import Modal from "../../components/ui/Modal";
import SortSearchFilterBar from "../../components/common/SortSearchFilterBar";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_OPTIONS = [
  { en: "pending", vn: "Chờ xác nhận" },
  { en: "confirmed", vn: "Đã nhận" },
  { en: "moving", vn: "Đang di chuyển" },
  { en: "caring", vn: "Đang chăm" },
  { en: "completed", vn: "Hoàn tất" },
  { en: "cancelled", vn: "Đã hủy" },
];

export default function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);

  // sort/search/filter
  const [sortBy, setSortBy] = useState("newest");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // staff assign modal
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignOrderId, setAssignOrderId] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [staffSearch, setStaffSearch] = useState("");

  const load = async () => {
    const res = await api.get("/admin/orders");
    setOrders(Array.isArray(res.data) ? res.data : []);
  };

  const loadStaff = async () => {
    const res = await api.get("/admin/staff");
    setStaffList(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => {
    load().catch(console.error);

    const interval = setInterval(() => load().catch(() => {}), 5000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/admin/orders/${id}`, { status: newStatus });
      load();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Update status failed");
    }
  };

  const handleDeleteOrder = async (id) => {
    const ok = window.confirm(`Xóa vĩnh viễn đơn #${id} khỏi CSDL?`);
    if (!ok) return;
    try {
      await api.delete(`/admin/orders/${id}`);
      alert("Xóa đơn thành công!");
      load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Xóa đơn thất bại");
    }
  };

  const openAssign = async (orderId) => {
    setAssignOrderId(orderId);
    setAssignOpen(true);
    setStaffSearch("");
    await loadStaff();
  };

  const chooseStaff = async (staffId) => {
    try {
      await api.post("/assignments", {
        order_id: assignOrderId,
        staff_id: Number(staffId),
      });
      alert("Gán staff thành công!");
      setAssignOpen(false);
      setAssignOrderId(null);
      load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Gán staff thất bại");
    }
  };

  const statusOptions = useMemo(() => {
    const set = new Set(orders.map((o) => o.status_vn || o.status));
    return Array.from(set);
  }, [orders]);

  const filteredSortedOrders = useMemo(() => {
    let list = [...orders];

    if (statusFilter !== "all") {
      list = list.filter(
        (o) =>
          (o.status_vn || o.status || "").toLowerCase() ===
          statusFilter.toLowerCase()
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          String(o.id).includes(q) ||
          (o.service_name || o.services || "").toLowerCase().includes(q) ||
          (o.customer_name || "").toLowerCase().includes(q) ||
          (o.address || "").toLowerCase().includes(q) ||
          (o.phone || o.customer_phone || "").toLowerCase().includes(q)
      );
    }

    const getDate = (o) =>
      new Date(o.date || o.scheduled_date || 0).getTime();
    const getTotal = (o) => Number(o.total || o.total_price || 0);
    const getService = (o) =>
      (o.service_name || o.services || "").toLowerCase();
    const getCustomer = (o) => (o.customer_name || "").toLowerCase();

    switch (sortBy) {
      case "customer_asc":
        list.sort((a, b) => getCustomer(a).localeCompare(getCustomer(b)));
        break;
      case "customer_desc":
        list.sort((a, b) => getCustomer(b).localeCompare(getCustomer(a)));
        break;
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

  const canAssignByStatus = (statusEn) => {
    return statusEn === "pending" || statusEn === "confirmed";
  };

  const filteredStaff = useMemo(() => {
    if (!staffSearch.trim()) return staffList;
    const q = staffSearch.toLowerCase();
    return staffList.filter(
      (s) =>
        String(s.id).includes(q) ||
        (s.full_name || s.name || "").toLowerCase().includes(q) ||
        (s.phone || "").toLowerCase().includes(q)
    );
  }, [staffList, staffSearch]);

  // ✅ yêu cầu 3: nếu > 10 đơn thì bật scroll
  const enableScroll = filteredSortedOrders.length > 10;

  // UI-only motion variants
  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
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
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <motion.h1
            variants={fadeUp}
            className="text-2xl md:text-3xl font-extrabold text-emerald-900 flex items-center gap-2"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md shadow-emerald-700/30">
              🧾
            </span>
            Quản lý đơn hàng
          </motion.h1>

          <motion.div
            variants={fadeUp}
            className="text-sm font-semibold text-emerald-900 bg-white/80 border border-emerald-200 rounded-full px-3 py-1 shadow-sm"
          >
            Hiển thị:{" "}
            <span className="font-extrabold text-emerald-800">
              {filteredSortedOrders.length}
            </span>{" "}
            / {orders.length} đơn
          </motion.div>
        </motion.div>

        {/* Sort / Search / Filter bar */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="bg-white rounded-2xl border border-emerald-100 shadow-lg p-3 md:p-4"
        >
          <SortSearchFilterBar
            sortValue={sortBy}
            onSortChange={setSortBy}
            searchValue={search}
            onSearchChange={setSearch}
            statusValue={statusFilter}
            onStatusChange={setStatusFilter}
            statusOptions={statusOptions}
            searchPlaceholder="Tìm theo mã / dịch vụ / khách / địa chỉ / SĐT"
          />
        </motion.div>

        {/* Table container */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className={`
            bg-white rounded-2xl border border-emerald-100 shadow-xl
            ${enableScroll ? "max-h-[560px] overflow-auto" : "overflow-hidden"}
          `}
        >
          <table className="min-w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-r from-emerald-700 via-green-600 to-lime-500 text-white text-left">
                <th className="p-3 font-extrabold">Mã đơn</th>
                <th className="p-3 font-extrabold">Khách hàng</th>
                <th className="p-3 font-extrabold">Dịch vụ</th>
                <th className="p-3 font-extrabold">Ngày hẹn</th>
                <th className="p-3 font-extrabold">Địa chỉ</th>
                <th className="p-3 font-extrabold">SĐT</th>
                <th className="p-3 font-extrabold">Tổng ($)</th>
                <th className="p-3 font-extrabold">Trạng thái</th>
                <th className="p-3 font-extrabold text-center">Hành động</th>
                <th className="p-3 font-extrabold text-center">Chi tiết</th>
                <th className="p-3 font-extrabold text-center">Xóa</th>
              </tr>
            </thead>

            <tbody>
              <AnimatePresence initial={false}>
                {filteredSortedOrders.map((o) => (
                  <motion.tr
                    key={o.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.22 }}
                    className="border-b hover:bg-emerald-50/70 transition-colors"
                  >
                    <td className="p-3 font-bold text-emerald-900">#{o.id}</td>
                    <td className="p-3">{o.customer_name}</td>
                    <td className="p-3 font-semibold text-gray-900">
                      {o.service_name}
                    </td>
                    <td className="p-3">{new Date(o.date).toLocaleString()}</td>
                    <td className="p-3">{o.address}</td>
                    <td className="p-3">{o.phone || o.customer_phone || "—"}</td>
                    <td className="p-3 font-extrabold text-emerald-900">
                      ${Number(o.total).toFixed(2)}
                    </td>

                    {/* ✅ Status pill FIX: text wrap nằm dưới text, không dưới icon */}
                    <td className="p-3">
                      <span
                        className="
                          inline-grid grid-cols-[auto,1fr] items-start gap-1.5
                          px-2.5 py-1.5 rounded-xl text-xs font-extrabold
                          bg-emerald-50 text-emerald-900 border border-emerald-100
                          max-w-[160px] md:max-w-none
                        "
                      >
                        <span className="leading-none mt-[1px]">✅</span>
                        <span className="leading-snug break-words">
                          {o.status_vn}
                        </span>
                      </span>
                    </td>

                    {/* ✅ Action cell FIX: flex-wrap + select co giãn */}
                    <td className="p-3 text-center">
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {canAssignByStatus(o.status) ? (
                          <button
                            onClick={() => openAssign(o.id)}
                            className="
                              bg-purple-600 text-white px-3 py-1 rounded-lg font-semibold
                              shadow hover:bg-purple-700 hover:shadow-md
                              active:scale-95 transition
                              whitespace-nowrap
                            "
                          >
                            Gán
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm px-2">—</span>
                        )}

                        <select
                          className="
                            border border-emerald-200 p-1.5 rounded-lg bg-white font-semibold
                            hover:border-emerald-300 transition
                            min-w-[120px] md:min-w-[140px]
                          "
                          value={o.status}
                          onChange={(e) => updateStatus(o.id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.en} value={s.en}>
                              {s.vn}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelected(o)}
                        className="
                          bg-blue-600 text-white px-3 py-1 rounded-lg font-semibold
                          shadow hover:bg-blue-700 hover:shadow-md
                          active:scale-95 transition
                        "
                      >
                        Xem
                      </button>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDeleteOrder(o.id)}
                        className="
                          bg-red-600 text-white px-3 py-1 rounded-lg font-semibold
                          shadow hover:bg-red-700 hover:shadow-md
                          active:scale-95 transition
                        "
                      >
                        Xóa
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {filteredSortedOrders.length === 0 && (
            <div className="p-6 text-center text-gray-500 font-semibold">
              Không có đơn phù hợp.
            </div>
          )}
        </motion.div>

        {/* Modal Chi tiết */}
        <Modal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          title={`Chi tiết đơn #${selected?.id}`}
        >
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoRow icon="🧾" label="Mã đơn" value={`#${selected.id}`} />
                <InfoRow icon="👤" label="Khách hàng" value={selected.customer_name} />
                <InfoRow icon="🌿" label="Dịch vụ" value={selected.service_name} />
                <InfoRow icon="🪴" label="Cây" value={selected.plant_name} />
                <InfoRow
                  icon="📅"
                  label="Ngày hẹn"
                  value={new Date(selected.date).toLocaleString()}
                />
                <InfoRow icon="📍" label="Địa chỉ" value={selected.address} />
                <InfoRow icon="📞" label="SĐT" value={selected.phone || "—"} />
                <InfoRow
                  icon="💵"
                  label="Tổng tiền"
                  value={`$${Number(selected.total).toFixed(2)}`}
                  strong
                />
              </div>

              <div className="pt-2 border-t border-emerald-100">
                <InfoRow icon="✅" label="Trạng thái" value={selected.status_vn} pill />
                <InfoRow icon="🎟️" label="Voucher" value={selected.voucher_code || "—"} />
                <InfoRow icon="📝" label="Ghi chú" value={selected.note || "—"} />
              </div>
            </motion.div>
          )}
        </Modal>

        {/* Modal Gán staff */}
        <Modal
          isOpen={assignOpen}
          onClose={() => setAssignOpen(false)}
          title={`Gán nhân viên cho đơn #${assignOrderId}`}
        >
          <div className="space-y-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">
                🔎
              </span>
              <input
                className="
                  border border-emerald-200 p-2.5 pl-10 rounded-xl w-full
                  font-semibold text-emerald-900 placeholder:text-gray-400
                  focus:outline-none focus:ring-2 focus:ring-emerald-300
                "
                placeholder="Tìm staff theo ID / tên / SĐT"
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
              />
            </div>

            <div className="max-h-80 overflow-auto space-y-2 pr-1">
              <AnimatePresence initial={false}>
                {filteredStaff.map((s) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.2 }}
                    className="
                      border border-emerald-100 rounded-xl p-3
                      flex justify-between items-center bg-white
                      hover:bg-emerald-50/60 hover:shadow-md transition
                    "
                  >
                    <div>
                      <div className="font-extrabold text-emerald-900">
                        #{s.id} — {s.full_name || s.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        📞 SĐT: {s.phone || "—"}
                      </div>
                    </div>
                    <button
                      onClick={() => chooseStaff(s.id)}
                      className="
                        px-3 py-1.5 bg-emerald-700 text-white rounded-lg font-semibold
                        shadow hover:bg-emerald-800 hover:shadow-lg
                        active:scale-95 transition
                      "
                    >
                      Chọn
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredStaff.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Không có staff phù hợp.
                </p>
              )}
            </div>
          </div>
        </Modal>

        <ScrollToTopButton />
      </div>
    </div>
  );
}

/* UI-only helper component (không đổi logic) */
function InfoRow({ icon, label, value, strong, pill }) {
  return (
    <div className="flex items-start gap-2 bg-emerald-50/50 border border-emerald-100 rounded-xl p-3">
      <div className="text-xl leading-none">{icon}</div>
      <div className="flex-1">
        <div className="text-xs font-extrabold text-emerald-900 uppercase tracking-wide">
          {label}
        </div>
        {!pill ? (
          <div
            className={`text-sm ${
              strong
                ? "font-extrabold text-emerald-900"
                : "font-semibold text-gray-800"
            }`}
          >
            {value || "—"}
          </div>
        ) : (
          <span className="inline-flex mt-1 items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-white text-emerald-900 border border-emerald-200">
            {value || "—"}
          </span>
        )}
      </div>
    </div>
  );
}
