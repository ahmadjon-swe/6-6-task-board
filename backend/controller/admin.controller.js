const pool = require("../database/db");

// GET /api/admin/users
const getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.user;
    if (role !== "admin") {
      return res.status(403).json({ message: "Ruxsat yo'q" });
    }

    const result = await pool.query(
      `SELECT id, user_username, user_email, user_role, user_created_at
       FROM users
       ORDER BY user_created_at DESC`
    );
    return res.status(200).json({ users: result.rows });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/users/:id
const updateUser = async (req, res, next) => {
  try {
    const { role: userRole } = req.user;
    const { id } = req.params;
    const { username, email, role } = req.body;

    if (userRole !== "admin") {
      return res.status(403).json({ message: "Ruxsat yo'q" });
    }

    const user = await pool.query("SELECT id FROM users WHERE id = $1", [id]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    }

    const result = await pool.query(
      `UPDATE users
       SET user_username = COALESCE($1, user_username),
           user_email    = COALESCE($2, user_email),
           user_role     = COALESCE($3::user_roles, user_role)
       WHERE id = $4
       RETURNING id, user_username, user_email, user_role, user_created_at`,
      [username || null, email || null, role || null, id]
    );

    return res.status(200).json({ message: "Foydalanuvchi yangilandi", user: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/users/:id
// CASCADE orqali shu userning barcha board va tasklari ham o'chadi
const deleteUser = async (req, res, next) => {
  try {
    const { role } = req.user;
    const { id } = req.params;

    if (role !== "admin") {
      return res.status(403).json({ message: "Ruxsat yo'q" });
    }

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    }

    return res.status(200).json({ message: "Foydalanuvchi o'chirildi" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, updateUser, deleteUser };