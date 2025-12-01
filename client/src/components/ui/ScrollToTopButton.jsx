// client/src/components/ui/ScrollToTopButton.jsx
import React, { useEffect, useState } from "react";

export default function ScrollToTopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > 5);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!show) return null;

  return (
    <button
      onClick={scrollToTop}
      title="Lên đầu trang"
      className="
        fixed bottom-6 right-6 z-50
        h-12 w-12 rounded-full
        bg-green-700 text-white
        shadow-lg shadow-green-700/30
        border border-white/30
        flex items-center justify-center
        hover:bg-green-800 active:scale-95
        transition-all duration-300 ease-out
        animate-bounce
      "
    >
      {/* arrow up icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 drop-shadow-sm"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}
