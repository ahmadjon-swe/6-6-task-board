const pool = require("../database/db")

// GET ONE /////////////////////////////////////////////////////////////////////////////////////////////////
const getOneTask = async (req, res) => {
  try {
    const {id} = req.params

    if(!id) return res.status(400).json({message: "task id is required"})

    const task = await pool.query(`select * from tasks where id = $1`, [id])

    res.status(200).json({task})
  } catch (error) {
    res.status(500).json({message: error.message})
  }
}

// GET ALL /////////////////////////////////////////////////////////////////////////////////////////////////
const getAllTasks = async (req, res) => {
  try {
    const board_id = req.params.id

    if(!board_id) return res.status(400).json({message: "board id is required"})

    let {page, limit, search, status} = req.query
    page = parseInt(page) || 1
    limit = parseInt(limit) || 10
    offset = (page-1)*limit
    search = search ?? ''
    status = status ?? '%'

    const tasks = await pool.query(`select * from tasks where task_board_id = $1 AND task_status::text ILIKE $2 AND task_title ILIKE $3 LIMIT $4 OFFSET $5`, [board_id, `%${status}%`, `%${search}%`, limit, offset])

    res.status(200).json({
      tasks: tasks.rows,
      page,
      limit
    })
  } catch (error) {
    res.status(500).json({message: error.message})
  }
}

// ADD ONE /////////////////////////////////////////////////////////////////////////////////////////////////
const addTask = async (req, res) => {
  try {
    const board_id = req.params.id
    const {title, desc} = req.body
    if(!board_id || !title || !desc) return res.status(400).json({message: "title, board_id and descriptions are required"})
    await pool.query(`insert into tasks(task_board_id, task_title, task_desc) values($1, $2, $3)`, [board_id, title, desc])

    res.status(201).json({message: "added task, successfully"})
  } catch (error) {
    res.status(500).json({message: error.message})
  }
}

// UPDATE /////////////////////////////////////////////////////////////////////////////////////////////////
const updateTask = async (req, res) => {
  try {
    const task_id = req.params.id
    const {title, desc, status} = req.body
    if(!task_id || !(title || desc || status)) return res.status(400).json({message: "task id and changes are required"})
    const { task_title: oldTitle, task_desc: oldDesc, task_status: oldStatus } = (await pool.query(`select task_title, task_desc, task_status from tasks where id = $1`, [task_id])).rows[0]
    await pool.query(`update tasks set task_title = $1, task_desc = $2, task_status = $3 where id = $4`, [title ?? oldTitle, desc ?? oldDesc, status ?? oldStatus, task_id])

    res.status(201).json({message: "updated task, successfully"})
  } catch (error) {
    res.status(500).json({message: error.message})
  }
}

// DELETE /////////////////////////////////////////////////////////////////////////////////////////////////
const deleteTask = async (req, res) => {
  try {
    const task_id = req.params.id
    if(!task_id) return res.status(400).json({message: "task id is required"})
    await pool.query(`delete from tasks where id = $1`, [task_id])

    res.status(201).json({message: "deleted task, successfully"})
  } catch (error) {
    res.status(500).json({message: error.message})
  }
}

module.exports = {
  getOneTask,
  getAllTasks,
  addTask,
  updateTask,
  deleteTask
}