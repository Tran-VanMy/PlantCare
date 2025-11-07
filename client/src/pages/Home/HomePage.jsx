import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="flex justify-between items-center p-6 bg-green-50 shadow">
        <h1 className="text-2xl font-bold text-green-700">PlantCare</h1>
        <nav className="flex gap-6">
          <a href="#home" className="hover:text-green-600">Home</a>
          <a href="#services" className="hover:text-green-600">Services</a>
          <a href="#contact" className="hover:text-green-600">Contact</a>
          <Link to="/login" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Login
          </Link>
        </nav>
      </header>

      {/* Hero section */}
      <section className="flex flex-col md:flex-row items-center justify-between p-10 bg-white">
        <div className="max-w-lg">
          <h2 className="text-4xl font-bold mb-4">Plant Care Service at Your Home</h2>
          <p className="text-gray-600 mb-6">
            We provide professional plant care at your doorstep. From pruning to pest control, we help your plants stay healthy.
          </p>
          <Link to="/register" className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700">
            Book Now
          </Link>
        </div>
        <img src="/images/plant-hero.jpg" alt="Plant Care" className="w-96 rounded-lg shadow-lg mt-6 md:mt-0" />
      </section>

      {/* Services section */}
      <section id="services" className="py-10 bg-green-50">
        <h3 className="text-center text-2xl font-bold mb-8">Our Services</h3>
        <div className="flex flex-wrap justify-center gap-8">
          {[
            { name: "Pruning", price: 10 },
            { name: "Fertilization", price: 5 },
            { name: "Pest Control", price: 8 },
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow hover:scale-105 transition">
              <div className="w-48 h-32 bg-gray-200 mb-4 rounded"></div>
              <h4 className="text-lg font-semibold">{s.name}</h4>
              <p className="text-green-600 font-medium">${s.price}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Booking form */}
      <section className="p-10">
        <h3 className="text-2xl font-bold mb-6">Schedule a visit</h3>
        <form className="max-w-md mx-auto flex flex-col gap-4">
          <input type="text" placeholder="Name" className="border rounded p-2" />
          <input type="text" placeholder="Phone" className="border rounded p-2" />
          <input type="date" className="border rounded p-2" />
          <button className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
            Book Now
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="text-center py-4 bg-green-100 text-gray-600">
        © 2025 PlantCare. All rights reserved.
      </footer>
    </div>
  );
}
