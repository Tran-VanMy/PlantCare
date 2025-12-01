// client/src/components/common/Footer.jsx
export default function Footer() {
  return (
    <footer className="mt-10 bg-white border-t border-emerald-200">
      <div className="max-w-7xl mx-auto px-6 py-8 grid md:grid-cols-3 gap-6">
        <div>
          <div className="flex items-center gap-2 text-xl font-extrabold text-emerald-700">
            <span className="inline-flex h-8 w-8 rounded-lg bg-emerald-700 text-white items-center justify-center shadow-sm">
              🌿
            </span>
            PlantCare
          </div>
          <p className="text-gray-700 mt-3 text-sm leading-relaxed">
            Professional plant care services right at your home.
            Helping your plants stay healthy and beautiful every day.
          </p>
        </div>

        <div className="text-sm">
          <div className="font-bold text-gray-900 mb-3">Quick Links</div>
          <ul className="space-y-2 text-gray-700 font-medium">
            <li><a href="#home" className="hover:text-emerald-700 transition">Home</a></li>
            <li><a href="#services" className="hover:text-emerald-700 transition">Services</a></li>
            <li><a href="#contact" className="hover:text-emerald-700 transition">Contact</a></li>
          </ul>
        </div>

        <div className="text-sm">
          <div className="font-bold text-gray-900 mb-3">Contact</div>
          <ul className="space-y-2 text-gray-700 font-medium">
            <li>📧 support@plantcare.example</li>
            <li>📞 +84 123 456 789</li>
            <li>📍 123 Plant St, Green City</li>
          </ul>
        </div>
      </div>

      <div className="text-center py-4 bg-emerald-50 text-gray-700 text-sm font-semibold">
        © 2025 PlantCare. All rights reserved.
      </div>
    </footer>
  );
}
