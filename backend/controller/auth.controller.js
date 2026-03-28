const pool = require("../database/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Barcha maydonlar to'ldirilishi shart" });
    }

    const existing = await pool.query(
      "SELECT id FROM users WHERE user_email = $1 OR user_username = $2",
      [email, username]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Email yoki username band" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (user_username, user_email, user_password)
       VALUES ($1, $2, $3)
       RETURNING id, user_username, user_email, user_role, user_created_at`,
      [username, email, hashed]
    );

    return res.status(201).json({ message: "Ro'yxatdan o'tildi", user: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email va parol kiritilishi shart" });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE user_email = $1",
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.user_password);
    if (!match) {
      return res.status(401).json({ message: "Parol noto'g'ri" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.user_username,
        email: user.user_email,
        role: user.user_role,
      },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Tizimga kirildi",
      token,
      user: {
        id: user.id,
        username: user.user_username,
        email: user.user_email,
        role: user.user_role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
const logout = (req, res) => {
  return res.status(200).json({ message: "Tizimdan chiqildi" });
};

// DELETE /api/auth/delete
// CASCADE orqali shu userning barcha board va tasklari ham o'chadi
const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    return res.status(200).json({ message: "Akkaunt o'chirildi" });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, deleteAccount };