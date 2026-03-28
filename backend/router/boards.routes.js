const router = require("express").Router();
const authentication = require("../middleware/authentication");
const {
  getBoards,
  getBoardById,
  createBoard,
  updateBoard,
  deleteBoard,
  addMember,
} = require("../controller/boards.controller");

router.get("/",              authentication, getBoards);
router.get("/:id",           authentication, getBoardById);
router.post("/",             authentication, createBoard);
router.put("/:id",           authentication, updateBoard);
router.delete("/:id",        authentication, deleteBoard);
router.post("/:id/members",  authentication, addMember);

module.exports = router;