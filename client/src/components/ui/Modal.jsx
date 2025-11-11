// client/src/components/common/Modal.jsx
import React from 'react';

/**
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - title: string
 * - children: node (optional)
 *
 * Simple Tailwind modal. Giữ nguyên UI Tailwind / taiwincss.
 */

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-lg max-w-lg w-full p-6 z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">✕</button>
        </div>
        <div>{children}</div>
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Đóng</button>
        </div>
      </div>
    </div>
  );
}
