// client/src/components/common/SortSearchFilterBar.jsx
import { useMemo } from "react";

/**
 * Props:
 * - sortValue: string
 * - onSortChange: (v)=>void
 * - searchValue: string
 * - onSearchChange: (v)=>void
 * - statusValue: string ("all" | ...)
 * - onStatusChange: (v)=>void
 * - statusOptions: string[]  (ex: ["Chờ xác nhận","Đã nhận"...])
 * - searchPlaceholder?: string
 */
export default function SortSearchFilterBar({
  sortValue,
  onSortChange,
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
  statusOptions = [],
  searchPlaceholder = "Tìm kiếm...",
}) {
  const options = useMemo(
    () => [
      { value: "date_asc", label: "Ngày ↑" },
      { value: "date_desc", label: "Ngày ↓" },
      { value: "id_asc", label: "Mã đơn ↑" },
      { value: "id_desc", label: "Mã đơn ↓" },
      { value: "service_asc", label: "Tên dịch vụ ↑" },
      { value: "service_desc", label: "Tên dịch vụ ↓" },
      { value: "total_asc", label: "Tổng tiền ↑" },
      { value: "total_desc", label: "Tổng tiền ↓" },
      { value: "newest", label: "Đơn mới nhất (trên cùng)" },
      { value: "oldest", label: "Đơn cũ nhất (trên cùng)" },
    ],
    []
  );

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
      {/* Sort select */}
      <select
        className="border p-2 rounded-md bg-white"
        value={sortValue}
        onChange={(e) => onSortChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {/* Search */}
      <input
        className="border p-2 rounded-md flex-1"
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      {/* Status filter icon + select */}
      <div className="flex items-center gap-2">
        <span title="Lọc theo trạng thái" className="text-xl">🔽</span>
        <select
          className="border p-2 rounded-md bg-white"
          value={statusValue}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
