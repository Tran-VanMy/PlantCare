-- server/src/db/migrate_v4.sql
BEGIN;

-- thêm cột customer_name để lưu tên người đặt thực tế
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_name VARCHAR(100);

-- backfill dữ liệu cũ: nếu NULL thì lấy tên tài khoản
UPDATE orders o
SET customer_name = u.full_name
FROM users u
WHERE o.customer_name IS NULL AND o.user_id = u.id;

COMMIT;
