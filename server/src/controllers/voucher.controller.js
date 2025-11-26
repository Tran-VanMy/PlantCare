import pool from "../db.js";

export const listMyVouchers = async (req, res) => {
  const userId = req.user.id;
  try {
    const r = await pool.query(
      `SELECT v.code, v.discount_percent, v.expires_at, uv.is_used
       FROM user_vouchers uv JOIN vouchers v ON uv.voucher_id=v.id
       WHERE uv.user_id=$1
       ORDER BY v.expires_at DESC`,
      [userId]
    );
    res.json(r.rows);
  } catch (err) {
    console.error("listMyVouchers", err);
    res.status(500).json({ error: err.message });
  }
};
