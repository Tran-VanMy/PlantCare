// client/src/components/ui/Modal.jsx
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - title: string
 * - children: node (optional)
 *
 * UI improved + smooth animations + always centered + safe scroll.
 * Logic unchanged.
 */

export default function Modal({ isOpen, onClose, title, children }) {
  // ✅ UI-only: khóa scroll nền khi mở modal để tránh bị lệch vị trí
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="
            fixed inset-0 z-50
            grid place-items-center
            p-4 md:p-6
            overflow-y-auto
          "
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal panel */}
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="
              relative z-10 w-full max-w-lg
              rounded-2xl border border-emerald-100 bg-white shadow-2xl
              overflow-hidden
              my-auto
            "
          >
            {/* Top gradient bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-700 via-green-600 to-lime-500" />

            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-emerald-50 bg-emerald-50/40">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-md shadow-emerald-700/30">
                  📌
                </span>
                <h3 className="text-lg md:text-xl font-extrabold text-emerald-900">
                  {title}
                </h3>
              </div>

              <button
                onClick={onClose}
                className="
                  inline-flex h-9 w-9 items-center justify-center rounded-xl
                  bg-white text-emerald-900 border border-emerald-200
                  hover:bg-emerald-100 hover:border-emerald-300
                  active:scale-95 transition
                "
                aria-label="Close"
                title="Đóng"
              >
                ✕
              </button>
            </div>

            {/* Body (✅ cuộn trong modal nếu dài) */}
            <div
              className="
                px-5 py-4
                max-h-[70vh] md:max-h-[75vh]
                overflow-y-auto
                scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-transparent
              "
            >
              {children}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-emerald-50 bg-emerald-50/30 flex justify-end">
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="
                  px-4 py-2 rounded-xl font-bold
                  bg-emerald-700 text-white shadow-md shadow-emerald-700/30
                  hover:bg-emerald-800 hover:shadow-lg
                  transition
                "
              >
                ✅ Đóng
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
