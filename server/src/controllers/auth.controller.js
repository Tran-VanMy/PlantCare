import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_EXPIRES_IN = "7d";

export const register = async (req, res) => {
  const { full_name, email, password, role } = req.body;

  try {
    if (!full_name || !email || !password)
      return res.status(400).json({ message: "Thiếu thông tin đăng ký." });

    const exists = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (exists.rowCount > 0)
      return res.status(400).json({ message: "Email đã tồn tại." });

    const hash = await bcrypt.hash(password, 10);

    let role_id = 3;
    if (role === "staff") role_id = 2;
    if (role === "admin") role_id = 1;

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role_id, created_at)
       VALUES ($1,$2,$3,$4,NOW()) RETURNING id, full_name, email, role_id`,
      [full_name, email, hash, role_id]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role_id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(201).json({ message: "Đăng ký thành công", token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (result.rowCount === 0) return res.status(400).json({ message: "Email không tồn tại." });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ message: "Sai mật khẩu." });

    const token = jwt.sign({ id: user.id, role: user.role_id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ message: "Đăng nhập thành công", token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const me = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, full_name, email, phone, address, role_id FROM users WHERE id=$1",
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
