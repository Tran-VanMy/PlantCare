-- ============================================
-- PLANTCARE DATABASE SCHEMA (PostgreSQL)
-- ============================================

-- 1️⃣ Bảng Roles (phân quyền)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,          -- 'admin', 'staff', 'customer'
    description TEXT
);

-- 2️⃣ Bảng Users (người dùng hệ thống)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role_id INT REFERENCES roles(id) DEFAULT 3,  -- 1=admin, 2=staff, 3=customer
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3️⃣ Bảng Plants (cây của khách hàng)
CREATE TABLE plants (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,           -- Tên cây (ví dụ: Cây Lan)
    type VARCHAR(100),                    -- Loại cây
    location TEXT,                        -- Vị trí trong nhà
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4️⃣ Bảng Services (dịch vụ chăm sóc cây)
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,           -- Tên dịch vụ (Pruning, Fertilization...)
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    duration_minutes INT,                 -- Thời lượng dự kiến
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- 5️⃣ Bảng Orders (đơn đặt dịch vụ)
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',   -- pending, confirmed, completed, cancelled
    scheduled_date TIMESTAMP,               -- Ngày đặt lịch
    total_price NUMERIC(10,2) DEFAULT 0,
    address TEXT,
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 6️⃣ Bảng Order_Items (chi tiết dịch vụ trong đơn)
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    service_id INT REFERENCES services(id),
    quantity INT DEFAULT 1,
    price NUMERIC(10,2) NOT NULL
);

-- 7️⃣ Bảng Staff (nhân viên chăm sóc cây)
CREATE TABLE staff (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(100),          -- Ví dụ: cây cảnh, bonsai, v.v.
    availability BOOLEAN DEFAULT TRUE,
    rating NUMERIC(3,2) DEFAULT 5.0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 8️⃣ Bảng Assignments (phân công nhân viên cho đơn hàng)
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    staff_id INT REFERENCES staff(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'assigned'  -- assigned, in_progress, done, cancelled
);

-- 9️⃣ Bảng Tasks (các công việc cụ thể của nhân viên)
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    assignment_id INT REFERENCES assignments(id) ON DELETE CASCADE,
    title VARCHAR(100),
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',  -- pending, completed, failed
    completed_at TIMESTAMP
);

-- 🔟 Bảng Payments (thanh toán)
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(50),            -- "cash", "credit_card", "paypal"
    payment_status VARCHAR(50) DEFAULT 'unpaid',  -- unpaid, paid, refunded
    transaction_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 1️⃣1️⃣ Bảng Notifications (thông báo cho người dùng)
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
