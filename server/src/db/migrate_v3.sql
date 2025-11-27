BEGIN;

-- lưu SĐT đặt theo từng order
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- lưu voucher code đã dùng (nếu có)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS voucher_code VARCHAR(30);

COMMIT;
