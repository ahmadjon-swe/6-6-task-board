const pool = require("../database/db");

// GET /api/tasks?board_id=xxx
// Statusga qarab guruhlangan (Trello kolonka mantiqida)
// User: faqat a'zo boardlari, Admin: hammasini
const getTasksByBoard = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;
    const { board_id } = req.query;

    if (!board_id) {
      return res.status(400).json({ message: "board_id kiritilishi shart" });
    }

    // Admin uchun board mavjudligini tekshirish, user uchun access ham tekshiriladi
    if (role === "admin") {
      const board = await pool.query("SELECT id FROM boards WHERE id = $1", [board_id]);
      if (board.rows.length === 0) {
        return res.status(404).json({ message: "Board topilmadi" });
      }
    } else {
      const access = await pool.query(
        `SELECT 1 FROM boards b
         WHERE b.id = $1
           AND (
             b.board_created_by = $2
             OR EXISTS (
               SELECT 1 FROM board_members bm
               WHERE bm.bm_board_id = b.id AND bm.bm_user_id = $2
             )
           )`,
        [board_id, userId]
      );
      if (access.rows.length === 0) {
        return res.status(403).json({ message: "Bu boardga ruxsat yo'q" });
      }
    }

    const result = await pool.query(
      `SELECT t.*,
              u.user_username AS created_by_username,
              a.user_username AS assigned_to_username
       FROM tasks t
       LEFT JOIN users u ON u.id = t.task_created_by
       LEFT JOIN users a ON a.id = t.task_assigned_to
       WHERE t.task_board_id = $1
       ORDER BY t.task_created_at DESC`,
      [board_id]
    );

    // Trello kolonka mantiqida guruhlash
    const grouped = {
      Pending: [],
      "In Progress": [],
      Partial: [],
      Completed: [],
    };
    result.rows.forEach((task) => {
      grouped[task.task_status].push(task);
    });

    return res.status(200).json({ tasks: grouped });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/:id
const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT t.*,
              u.user_username AS created_by_username,
              a.user_username AS assigned_to_username
       FROM tasks t
       LEFT JOIN users u ON u.id = t.task_created_by
       LEFT JOIN users a ON a.id = t.task_assigned_to
       WHERE t.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task topilmadi" });
    }

    return res.status(200).json({ task: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;
    const { board_id, title, desc, assigned_to, due_date } = req.body;

    if (!board_id || !title) {
      return res.status(400).json({ message: "board_id va title kiritilishi shart" });
    }

    if (role === "admin") {
      const board = await pool.query("SELECT id FROM boards WHERE id = $1", [board_id]);
      if (board.rows.length === 0) {
        return res.status(404).json({ message: "Board topilmadi" });
      }
    } else {
      const access = await pool.query(
        `SELECT 1 FROM boards b
         WHERE b.id = $1
           AND (
             b.board_created_by = $2
             OR EXISTS (
               SELECT 1 FROM board_members bm
               WHERE bm.bm_board_id = b.id AND bm.bm_user_id = $2
             )
           )`,
        [board_id, userId]
      );
      if (access.rows.length === 0) {
        return res.status(403).json({ message: "Bu boardga ruxsat yo'q" });
      }
    }

    const result = await pool.query(
      `INSERT INTO tasks
         (task_board_id, task_created_by, task_title, task_desc, task_assigned_to, task_due_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [board_id, userId, title, desc || null, assigned_to || null, due_date || null]
    );

    return res.status(201).json({ message: "Task yaratildi", task: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// PUT /api/tasks/:id
// Faqat yaratgan user yoki admin
const updateTask = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;
    const { id } = req.params;
    const { title, desc, status, assigned_to, due_date } = req.body;

    const task = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
    if (task.rows.length === 0) {
      return res.status(404).json({ message: "Task topilmadi" });
    }

    if (task.rows[0].task_created_by !== userId && role !== "admin") {
      return res.status(403).json({ message: "Ruxsat yo'q" });
    }

    const result = await pool.query(
      `UPDATE tasks
       SET task_title       = COALESCE($1, task_title),
           task_desc        = COALESCE($2, task_desc),
           task_status      = COALESCE($3::task_status_types, task_status),
           task_assigned_to = COALESCE($4, task_assigned_to),
           task_due_date    = COALESCE($5, task_due_date)
       WHERE id = $6
       RETURNING *`,
      [title || null, desc || null, status || null, assigned_to || null, due_date || null, id]
    );

    return res.status(200).json({ message: "Task yangilandi", task: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id
// Faqat yaratgan user yoki admin
const deleteTask = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;
    const { id } = req.params;

    const task = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
    if (task.rows.length === 0) {
      return res.status(404).json({ message: "Task topilmadi" });
    }

    if (task.rows[0].task_created_by !== userId && role !== "admin") {
      return res.status(403).json({ message: "Ruxsat yo'q" });
    }

    await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
    return res.status(200).json({ message: "Task o'chirildi" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasksByBoard, getTaskById, createTask, updateTask, deleteTask };