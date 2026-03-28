const pool = require("../database/db");

// GET /api/boards
// User: o'zi yaratgan yoki a'zo bo'lgan boardlar
// Admin: hamma boardlar
const getBoards = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;

    let result;
    if (role === "admin") {
      result = await pool.query(
        `SELECT b.*, u.user_username AS created_by_username
         FROM boards b
         JOIN users u ON u.id = b.board_created_by
         ORDER BY b.board_created_at DESC`
      );
    } else {
      result = await pool.query(
        `SELECT b.*, u.user_username AS created_by_username
         FROM boards b
         JOIN users u ON u.id = b.board_created_by
         WHERE b.board_created_by = $1
            OR EXISTS (
              SELECT 1 FROM board_members bm
              WHERE bm.bm_board_id = b.id AND bm.bm_user_id = $1
            )
         ORDER BY b.board_created_at DESC`,
        [userId]
      );
    }

    return res.status(200).json({ boards: result.rows });
  } catch (err) {
    next(err);
  }
};

// GET /api/boards/:id
// User: faqat o'zi a'zo yoki yaratgan board
// Admin: istalgan board
const getBoardById = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;
    const { id } = req.params;

    let result;
    if (role === "admin") {
      result = await pool.query(
        `SELECT b.*, u.user_username AS created_by_username
         FROM boards b
         JOIN users u ON u.id = b.board_created_by
         WHERE b.id = $1`,
        [id]
      );
    } else {
      result = await pool.query(
        `SELECT b.*, u.user_username AS created_by_username
         FROM boards b
         JOIN users u ON u.id = b.board_created_by
         WHERE b.id = $1
           AND (
             b.board_created_by = $2
             OR EXISTS (
               SELECT 1 FROM board_members bm
               WHERE bm.bm_board_id = b.id AND bm.bm_user_id = $2
             )
           )`,
        [id, userId]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Board topilmadi yoki ruxsat yo'q" });
    }

    return res.status(200).json({ board: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// POST /api/boards
const createBoard = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { title, desc } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Board nomi kiritilishi shart" });
    }

    const result = await pool.query(
      `INSERT INTO boards (board_title, board_desc, board_created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, desc || null, userId]
    );

    // Yaratuvchini board_members ga avtomatik qo'shish
    await pool.query(
      `INSERT INTO board_members (bm_board_id, bm_user_id) VALUES ($1, $2)`,
      [result.rows[0].id, userId]
    );

    return res.status(201).json({ message: "Board yaratildi", board: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// PUT /api/boards/:id
// Faqat yaratgan user yoki admin
const updateBoard = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;
    const { id } = req.params;
    const { title, desc } = req.body;

    const board = await pool.query("SELECT * FROM boards WHERE id = $1", [id]);
    if (board.rows.length === 0) {
      return res.status(404).json({ message: "Board topilmadi" });
    }

    if (board.rows[0].board_created_by !== userId && role !== "admin") {
      return res.status(403).json({ message: "Ruxsat yo'q" });
    }

    const result = await pool.query(
      `UPDATE boards
       SET board_title = COALESCE($1, board_title),
           board_desc  = COALESCE($2, board_desc)
       WHERE id = $3
       RETURNING *`,
      [title || null, desc || null, id]
    );

    return res.status(200).json({ message: "Board yangilandi", board: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/boards/:id
// Faqat yaratgan user yoki admin
const deleteBoard = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;
    const { id } = req.params;

    const board = await pool.query("SELECT * FROM boards WHERE id = $1", [id]);
    if (board.rows.length === 0) {
      return res.status(404).json({ message: "Board topilmadi" });
    }

    if (board.rows[0].board_created_by !== userId && role !== "admin") {
      return res.status(403).json({ message: "Ruxsat yo'q" });
    }

    await pool.query("DELETE FROM boards WHERE id = $1", [id]);
    return res.status(200).json({ message: "Board o'chirildi" });
  } catch (err) {
    next(err);
  }
};

// POST /api/boards/:id/members
// Faqat yaratgan user yoki admin member qo'sha oladi
const addMember = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;
    const { id } = req.params;
    const { memberId } = req.body;

    if (!memberId) {
      return res.status(400).json({ message: "memberId kiritilishi shart" });
    }

    const board = await pool.query("SELECT * FROM boards WHERE id = $1", [id]);
    if (board.rows.length === 0) {
      return res.status(404).json({ message: "Board topilmadi" });
    }

    if (board.rows[0].board_created_by !== userId && role !== "admin") {
      return res.status(403).json({ message: "Ruxsat yo'q" });
    }

    const member = await pool.query("SELECT id FROM users WHERE id = $1", [memberId]);
    if (member.rows.length === 0) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    }

    await pool.query(
      `INSERT INTO board_members (bm_board_id, bm_user_id)
       VALUES ($1, $2)
       ON CONFLICT (bm_board_id, bm_user_id) DO NOTHING`,
      [id, memberId]
    );

    return res.status(200).json({ message: "Member qo'shildi" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getBoards, getBoardById, createBoard, updateBoard, deleteBoard, addMember };