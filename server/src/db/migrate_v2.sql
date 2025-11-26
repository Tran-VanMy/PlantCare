-- server/src/db/migrate_v2.sql
BEGIN;

-- 0) thêm cột trạng thái chuẩn VN cho orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS status_vn VARCHAR(50) DEFAULT 'Chờ xác nhận';

-- 1) Voucher/KM
CREATE TABLE IF NOT EXISTS vouchers (
  id SERIAL PRIMARY KEY,
  code VARCHAR(30) UNIQUE NOT NULL,
  discount_percent INT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_vouchers (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  voucher_id INT REFERENCES vouchers(id) ON DELETE CASCADE,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP
);

-- 2) Gắn cây vào đơn (1 đơn có thể cho 1 cây, đơn giản hóa)
CREATE TABLE IF NOT EXISTS order_plants (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  plant_id INT REFERENCES plants(id) ON DELETE SET NULL
);

-- 3) Lưu lịch sử trạng thái đơn
CREATE TABLE IF NOT EXISTS order_status_history (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  from_status VARCHAR(50),
  to_status VARCHAR(50),
  changed_by INT REFERENCES users(id),
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4) Đánh giá sau dịch vụ
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  staff_id INT REFERENCES staff(id) ON DELETE SET NULL,
  stars INT CHECK (stars BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5) Báo cáo sự cố
CREATE TABLE IF NOT EXISTS incidents (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  staff_id INT REFERENCES staff(id) ON DELETE SET NULL,
  title VARCHAR(100),
  message TEXT,
  status VARCHAR(30) DEFAULT 'open', -- open, in_review, resolved
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6) Staff bonus theo mốc chẵn
CREATE TABLE IF NOT EXISTS staff_bonuses (
  id SERIAL PRIMARY KEY,
  staff_id INT REFERENCES staff(id) ON DELETE CASCADE,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  milestone INT NOT NULL, -- 2,4,6,8,10...
  bonus_amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

COMMIT;
