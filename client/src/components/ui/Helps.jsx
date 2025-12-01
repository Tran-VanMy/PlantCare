// client/src/components/ui/Helps.jsx
import React, { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - defaultRoleId?: number (1 admin, 2 staff, 3 customer)
 *
 * UI-only. Không thay đổi logic nghiệp vụ.
 */
export default function Helps({ isOpen, onClose, defaultRoleId = 3 }) {
  const [roleId, setRoleId] = useState(defaultRoleId);

  useEffect(() => {
    setRoleId(defaultRoleId);
  }, [defaultRoleId, isOpen]);

  const roles = useMemo(
    () => [
      { id: 3, label: "Khách hàng", icon: "🧑‍🌾" },
      { id: 2, label: "Nhân viên", icon: "👨‍🔧" },
      { id: 1, label: "Quản trị viên", icon: "🛡️" },
    ],
    []
  );

  const guides = useMemo(
    () => ({
      3: {
        title: "Hướng dẫn cho Khách hàng",
        sections: [
          {
            icon: "🏠",
            heading: "Dashboard",
            items: [
              "Xem tổng quan tài khoản, cây trồng và các đơn đã đặt.",
              "Theo dõi nhanh trạng thái các đơn gần nhất.",
            ],
          },
          {
            icon: "🪴",
            heading: "My Plants",
            items: [
              "Thêm cây mới của bạn để theo dõi lịch chăm sóc.",
              "Xem danh sách cây và tình trạng hiện tại.",
            ],
          },
          {
            icon: "🧾",
            heading: "Order History",
            items: [
              "Xem toàn bộ đơn đã đặt và trạng thái từng đơn.",
              "Nhấn 'Chi tiết' để xem cụ thể dịch vụ và lịch hẹn.",
            ],
          },
          {
            icon: "🎟️",
            heading: "Voucher",
            items: [
              "Xem voucher đang có và hạn sử dụng.",
              "Áp voucher khi đặt dịch vụ để giảm giá.",
            ],
          },
        ],
      },
      2: {
        title: "Hướng dẫn cho Nhân viên",
        sections: [
          {
            icon: "📌",
            heading: "Staff Dashboard",
            items: [
              "Tab 'Đơn chờ nhận': xem danh sách đơn mới.",
              "Nhấn 'Nhận đơn' để nhận task.",
              "Nhấn 'Xem' để xem nhanh chi tiết đơn ngay tại modal.",
            ],
          },
          {
            icon: "🧰",
            heading: "Tasks",
            items: [
              "Danh sách các đơn bạn đang phụ trách.",
              "Có thể sắp xếp / tìm kiếm / lọc theo trạng thái.",
              "Nhấn 'Chi tiết' để vào trang thực hiện chăm sóc.",
            ],
          },
          {
            icon: "📜",
            heading: "Task History",
            items: [
              "Xem lịch sử các đơn đã hoàn tất hoặc đã hủy.",
              "Giúp theo dõi công việc và thu nhập.",
            ],
          },
          {
            icon: "🚗🌿✅",
            heading: "Luồng thao tác đơn",
            items: [
              "Đã nhận → Di chuyển → Đang chăm → Hoàn tất.",
              "Nút hành động sẽ tự hiện theo đúng trạng thái.",
            ],
          },
        ],
      },
      1: {
        title: "Hướng dẫn cho Quản trị viên",
        sections: [
          {
            icon: "📊",
            heading: "Admin Dashboard",
            items: [
              "Xem tổng quan hệ thống: đơn hàng, nhân viên, khách hàng, doanh thu.",
            ],
          },
          {
            icon: "👥",
            heading: "Users",
            items: [
              "Quản lý danh sách user.",
              "Có thể đổi vai trò hoặc xóa tài khoản.",
            ],
          },
          {
            icon: "🌿",
            heading: "Services",
            items: [
              "Theo dõi các dịch vụ đang có.",
              "Sắp xếp và lọc theo giá.",
            ],
          },
          {
            icon: "🧾",
            heading: "Orders",
            items: [
              "Theo dõi tất cả đơn trong hệ thống.",
              "Gán nhân viên cho đơn ở trạng thái Chờ xác nhận/Đã nhận.",
              "Cập nhật trạng thái hoặc xóa đơn.",
            ],
          },
          {
            icon: "📈",
            heading: "Reports",
            items: [
              "Xem báo cáo doanh thu và thống kê cơ bản của hệ thống.",
            ],
          },
        ],
      },
    }),
    []
  );

  const currentGuide = guides[roleId] || guides[3];

  const fadeUp = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
    exit: { opacity: 0, y: 8, transition: { duration: 0.2 } },
  };

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="❓ Hướng dẫn sử dụng">
      <div className="space-y-4">
        {/* Role selection */}
        <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-2 flex flex-wrap gap-2 sticky top-0 z-10">
          {roles.map((r) => {
            const active = r.id === roleId;
            return (
              <button
                key={r.id}
                onClick={() => setRoleId(r.id)}
                className={`
                  px-3 py-2 rounded-xl text-sm font-extrabold flex items-center gap-1.5
                  transition-all duration-200
                  ${
                    active
                      ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/25"
                      : "bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-100"
                  }
                `}
              >
                <span className="text-base">{r.icon}</span>
                {r.label}
              </button>
            );
          })}
        </div>

        {/* ✅ Scroll container for guide */}
        <div
          className="
            max-h-[60vh] overflow-auto pr-1
            scroll-smooth
            [scrollbar-width:thin]
            [scrollbar-color:#10b98122_transparent]
          "
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={roleId}
              initial="hidden"
              animate="show"
              exit="exit"
              variants={stagger}
              className="space-y-3"
            >
              <motion.h3
                variants={fadeUp}
                className="text-lg font-extrabold text-emerald-900"
              >
                {currentGuide.title}
              </motion.h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentGuide.sections.map((sec, idx) => (
                  <motion.div
                    variants={fadeUp}
                    key={idx}
                    className="
                      bg-white border border-emerald-100 rounded-2xl p-3 shadow-sm
                      hover:shadow-md hover:bg-emerald-50/40 transition
                    "
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-xl">{sec.icon}</div>
                      <div className="font-extrabold text-emerald-900">
                        {sec.heading}
                      </div>
                    </div>

                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 font-semibold">
                      {sec.items.map((it, i) => (
                        <li key={i} className="leading-relaxed">
                          {it}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>

              <motion.div
                variants={fadeUp}
                className="text-xs text-gray-500 font-semibold pt-1"
              >
                Tip: Bạn có thể đổi role ở thanh chọn trên để xem hướng dẫn phù hợp.
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
}
