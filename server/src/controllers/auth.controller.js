// backend/src/controllers/auth.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_EXPIRES_IN = "7d";

// =============================
//  REGISTER
// =============================
export const register = async (req, res) => {
  const { full_name, email, password, role, role_id } = req.body;

  try {
    if (!full_name || !email || !password) {
      return res.status(400).json({ message: "Thiếu thông tin đăng ký." });
    }

    // Kiểm tra email trùng
    const exists = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (exists.rowCount > 0) {
      return res.status(400).json({ message: "Email đã tồn tại." });
    }

    const hash = await bcrypt.hash(password, 10);

    // =============================
    // FIX ROLE — CHÍNH XÁC 100%
    // =============================
    // Ưu tiên role_id (frontend gửi dạng số)
    // Nếu không có thì map role dạng text
    let finalRole = 3;

    if (role_id) {
      finalRole = Number(role_id);
    } else if (role === "admin") {
      finalRole = 1;
    } else if (role === "staff") {
      finalRole = 2;
    }

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role_id, created_at)
       VALUES ($1,$2,$3,$4,NOW())
       RETURNING id, full_name, email, role_id`,
      [full_name, email, hash, finalRole]
    );

    const user = result.rows[0];

    // JWT
    const token = jwt.sign(
      { id: user.id, role: user.role_id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      message: "Đăng ký thành công",
      token,
      user,
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// =============================
//  LOGIN
// =============================
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Kiểm tra user tồn tại
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (result.rowCount === 0) {
      return res.status(400).json({ message: "Email không tồn tại." });
    }

    const user = result.rows[0];

    // Kiểm tra mật khẩu
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ message: "Sai mật khẩu." });
    }

    // Token
    const token = jwt.sign(
      { id: user.id, role: user.role_id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      message: "Đăng nhập thành công",
      token,
      user,
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// =============================
//  GET CURRENT USER
// =============================
export const me = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, phone, address, role_id
       FROM users
       WHERE id=$1`,
      [req.user.id]
    );

    return res.json(result.rows[0]);

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
