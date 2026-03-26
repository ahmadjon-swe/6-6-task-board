const pool = require("../database/db")

// GET ONE /////////////////////////////////////////////////////////////////////////////////////////////////
const getOneBoard = async (req, res) => {
  try {
    const {id} = req.params

    if(!id) return res.status(400).json({message: "board id is required"})

    const board = await pool.query(`select * from boards where id = $1`, [id])

    res.status(200).json({board})
  } catch (error) {
    res.status(500).json({message: error.message})
  }
}

// GET ALL /////////////////////////////////////////////////////////////////////////////////////////////////
const getAllBoards = async (req, res) => {
  try {
    let {page, limit, search} = req.query
    page = parseInt(page) || 1
    limit = parseInt(limit) || 10
    offset = (page-1)*limit
    search = search ?? '%'

    const boards = await pool.query( `select * from boards WHERE board_title ILIKE $1 LIMIT $2 OFFSET $3`, [`%${search}%`, limit, offset])

    res.status(200).json({
      boards: boards.rows,
      page,
      limit
    })
  } catch (error) {
    res.status(500).json({message: error.message})
  }
}

// ADD ONE /////////////////////////////////////////////////////////////////////////////////////////////////
const addBoard = async (req, res) => {
  try {
    const {title, desc} = req.body

    if(!title || !desc) return res.status(400).json({message: "title and desc are required"})
    
    await pool.query(`insert into boards(board_title, board_desc) values($1, $2)`, [title, desc])

    res.status(201).json({message: "added board, successfully"})
  } catch (error) {
    res.status(500).json({message: error.message})
  }
}

// UPDATE /////////////////////////////////////////////////////////////////////////////////////////////////
const updateBoard = async (req, res) => {
  try {
    const board_id = req.params.id
    const {title, desc} = req.body
    if(!board_id || !(title || desc)) return res.status(400).json({message: "title or desc and board_ids are required"})
    const { board_title: oldTitle, board_desc: oldDesc } =(await pool.query(`select board_title, board_desc from boards where id = $1`, [board_id])).rows[0]
    await pool.query(`update boards set board_title=$1, board_desc=$2 where id=$3`,
    [title ?? oldTitle, desc ?? oldDesc, board_id])

    res.status(201).json({message: "updated board, successfully"})
  } catch (error) {
    res.status(500).json({message: error.message})
  }
}

// DELETE /////////////////////////////////////////////////////////////////////////////////////////////////
const deleteBoard = async (req, res) => {
  try {
    const board_id = req.params.id
    if(!board_id) return res.status(400).json({message: "board_id is required"})
    await pool.query(`delete from boards where id = $1`, [board_id])

    res.status(201).json({message: "deleted board, successfully"})
  } catch (error) {
    res.status(500).json({message: error.message})
  }
}

module.exports = {
  getOneBoard,
  getAllBoards,
  addBoard,
  updateBoard,
  deleteBoard
}