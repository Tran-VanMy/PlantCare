import { useState } from "react";
import { Link } from "react-router-dom";

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Register", form);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input name="fullName" placeholder="Full Name" className="border p-2 rounded" onChange={handleChange} />
          <input name="email" type="email" placeholder="Email" className="border p-2 rounded" onChange={handleChange} />
          <input name="phone" placeholder="Phone" className="border p-2 rounded" onChange={handleChange} />
          <input name="password" type="password" placeholder="Password" className="border p-2 rounded" onChange={handleChange} />
          <button className="bg-green-600 text-white py-2 rounded hover:bg-green-700">Register</button>
        </form>
        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
