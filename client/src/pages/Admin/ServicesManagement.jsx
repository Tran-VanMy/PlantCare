import { useEffect, useMemo, useState } from "react";
import api from "../../api/api";

export default function ServicesManagement() {
  const [services, setServices] = useState([]);
  const [sortBy, setSortBy] = useState("id_asc");
  const [search, setSearch] = useState("");
  const [priceFilter, setPriceFilter] = useState("all"); // "all" | "lt50" | "50to100" | "gt100"

  useEffect(() => {
    api.get("/admin/services")
      .then((res) => setServices(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Failed to load services:", err));
  }, []);

  const filteredSorted = useMemo(() => {
    let arr = [...services];

    if (priceFilter !== "all") {
      arr = arr.filter(s => {
        const p = Number(s.price || 0);
        if (priceFilter === "lt50") return p < 50;
        if (priceFilter === "50to100") return p >= 50 && p <= 100;
        if (priceFilter === "gt100") return p > 100;
        return true;
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(s =>
        String(s.id).includes(q) ||
        (s.name || "").toLowerCase().includes(q) ||
        String(s.price).includes(q)
      );
    }

    const getName = (s) => (s.name || "").toLowerCase();
    const getPrice = (s) => Number(s.price || 0);

    switch (sortBy) {
      case "id_desc": arr.sort((a,b)=>b.id-a.id); break;
      case "name_asc": arr.sort((a,b)=>getName(a).localeCompare(getName(b))); break;
      case "name_desc": arr.sort((a,b)=>getName(b).localeCompare(getName(a))); break;
      case "price_asc": arr.sort((a,b)=>getPrice(a)-getPrice(b)); break;
      case "price_desc": arr.sort((a,b)=>getPrice(b)-getPrice(a)); break;
      case "id_asc":
      default: arr.sort((a,b)=>a.id-b.id); break;
    }

    return arr;
  }, [services, sortBy, search, priceFilter]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-4">Quản lý dịch vụ</h1>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <select
          className="border p-2 rounded bg-white"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="id_asc">ID ↑</option>
          <option value="id_desc">ID ↓</option>
          <option value="name_asc">Tên dịch vụ ↑</option>
          <option value="name_desc">Tên dịch vụ ↓</option>
          <option value="price_asc">Giá ↑</option>
          <option value="price_desc">Giá ↓</option>
        </select>

        <input
          className="border p-2 rounded flex-1"
          placeholder="Tìm theo ID / tên dịch vụ / giá"
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
        />

        <div className="flex items-center gap-2">
          <span title="Lọc theo giá" className="text-xl">🔽</span>
          <select
            className="border p-2 rounded bg-white"
            value={priceFilter}
            onChange={(e)=>setPriceFilter(e.target.value)}
          >
            <option value="all">Tất cả giá</option>
            <option value="lt50">&lt; 50$</option>
            <option value="50to100">50$ - 100$</option>
            <option value="gt100">&gt; 100$</option>
          </select>
        </div>
      </div>

      <table className="min-w-full bg-white rounded-lg shadow">
        <thead>
          <tr className="bg-green-100">
            <th className="p-3">ID</th>
            <th className="p-3">Tên dịch vụ</th>
            <th className="p-3">Giá ($)</th>
          </tr>
        </thead>
        <tbody>
          {filteredSorted.map((s) => (
            <tr key={s.id} className="border-b hover:bg-green-50">
              <td className="p-3">{s.id}</td>
              <td className="p-3">{s.name}</td>
              <td className="p-3">{s.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
