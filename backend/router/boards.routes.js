const {Router} = require("express")
const { getAllBoards, getOneBoard, addBoard, updateBoard, deleteBoard } = require("../controller/boards.controller")

const boardRouter = Router()

boardRouter.get("/get_all_boards/", getAllBoards)
boardRouter.get("/get_one_board/:id", getOneBoard)
boardRouter.post("/add_board/", addBoard)
boardRouter.put("/update_board/:id", updateBoard)
boardRouter.delete("/delete_board/:id", deleteBoard)

module.exports = boardRouter