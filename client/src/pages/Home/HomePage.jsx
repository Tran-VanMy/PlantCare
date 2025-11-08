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






















// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import api from "../../api/api";

// export default function HomePage() {
//   const [services, setServices] = useState([]);
//   const [form, setForm] = useState({
//     full_name: "",
//     phone: "",
//     scheduled_date: "",
//     service_ids: [],
//   });
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   // Lấy danh sách dịch vụ thật từ backend
//   useEffect(() => {
//     const fetchServices = async () => {
//       try {
//         const res = await api.get("/services");
//         setServices(res.data);
//       } catch (err) {
//         console.error("Failed to load services:", err);
//       }
//     };
//     fetchServices();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     if (name === "service_ids") {
//       const id = parseInt(value);
//       setForm((prev) => ({
//         ...prev,
//         service_ids: checked
//           ? [...prev.service_ids, id]
//           : prev.service_ids.filter((sid) => sid !== id),
//       }));
//     } else {
//       setForm((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.full_name || !form.phone || !form.scheduled_date || form.service_ids.length === 0) {
//       setMessage("Vui lòng điền đầy đủ thông tin và chọn ít nhất 1 dịch vụ.");
//       return;
//     }
//     setLoading(true);
//     setMessage("");
//     try {
//       await api.post("/orders", {
//         user_id: null, // Nếu chưa login
//         full_name: form.full_name,
//         phone: form.phone,
//         scheduled_date: form.scheduled_date,
//         service_ids: form.service_ids,
//       });
//       setMessage("Đặt lịch thành công!");
//       setForm({ full_name: "", phone: "", scheduled_date: "", service_ids: [] });
//     } catch (err) {
//       console.error(err);
//       setMessage("Có lỗi xảy ra. Vui lòng thử lại.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col font-sans">
//       {/* Header */}
//       <header className="flex justify-between items-center p-6 bg-green-50 shadow">
//         <h1 className="text-2xl font-bold text-green-700">PlantCare</h1>
//         <nav className="flex gap-6">
//           <a href="#home" className="hover:text-green-600">Home</a>
//           <a href="#services" className="hover:text-green-600">Services</a>
//           <a href="#contact" className="hover:text-green-600">Contact</a>
//           <Link to="/login" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
//             Login
//           </Link>
//         </nav>
//       </header>

//       {/* Hero section */}
//       <section className="flex flex-col md:flex-row items-center justify-between p-10 bg-white">
//         <div className="max-w-lg">
//           <h2 className="text-4xl font-bold mb-4">Plant Care Service at Your Home</h2>
//           <p className="text-gray-600 mb-6">
//             We provide professional plant care at your doorstep. From pruning to pest control, we help your plants stay healthy.
//           </p>
//           <Link to="/register" className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700">
//             Book Now
//           </Link>
//         </div>
//         <img src="/images/plant-hero.jpg" alt="Plant Care" className="w-96 rounded-lg shadow-lg mt-6 md:mt-0" />
//       </section>

//       {/* Services section */}
//       <section id="services" className="py-10 bg-green-50">
//         <h3 className="text-center text-2xl font-bold mb-8">Our Services</h3>
//         <div className="flex flex-wrap justify-center gap-8">
//           {services.map((s) => (
//             <div key={s.id} className="bg-white p-6 rounded-lg shadow hover:scale-105 transition">
//               <div className="w-48 h-32 bg-gray-200 mb-4 rounded">
//                 {s.image_url && <img src={s.image_url} alt={s.name} className="w-full h-full object-cover rounded" />}
//               </div>
//               <h4 className="text-lg font-semibold">{s.name}</h4>
//               <p className="text-green-600 font-medium">${s.price}</p>
//               <label className="flex items-center gap-2 mt-2">
//                 <input
//                   type="checkbox"
//                   name="service_ids"
//                   value={s.id}
//                   checked={form.service_ids.includes(s.id)}
//                   onChange={handleChange}
//                 />
//                 Chọn
//               </label>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Booking form */}
//       <section id="contact" className="p-10">
//         <h3 className="text-2xl font-bold mb-6">Schedule a visit</h3>
//         <form className="max-w-md mx-auto flex flex-col gap-4" onSubmit={handleSubmit}>
//           <input
//             type="text"
//             name="full_name"
//             placeholder="Name"
//             className="border rounded p-2"
//             value={form.full_name}
//             onChange={handleChange}
//           />
//           <input
//             type="text"
//             name="phone"
//             placeholder="Phone"
//             className="border rounded p-2"
//             value={form.phone}
//             onChange={handleChange}
//           />
//           <input
//             type="date"
//             name="scheduled_date"
//             className="border rounded p-2"
//             value={form.scheduled_date}
//             onChange={handleChange}
//           />
//           <button
//             type="submit"
//             className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
//             disabled={loading}
//           >
//             {loading ? "Đang gửi..." : "Book Now"}
//           </button>
//           {message && <p className="text-center text-red-600 mt-2">{message}</p>}
//         </form>
//       </section>

//       {/* Footer */}
//       <footer className="text-center py-4 bg-green-100 text-gray-600">
//         © 2025 PlantCare. All rights reserved.
//       </footer>
//     </div>
//   );
// }
