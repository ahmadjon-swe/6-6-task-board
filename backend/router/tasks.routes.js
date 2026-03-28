const router = require("express").Router();
const authentication = require("../middleware/authentication");
const {
  getTasksByBoard,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require("../controller/tasks.controller");

router.get("/",       authentication, getTasksByBoard);  // ?board_id=xxx
router.get("/:id",    authentication, getTaskById);
router.post("/",      authentication, createTask);
router.put("/:id",    authentication, updateTask);
router.delete("/:id", authentication, deleteTask);

module.exports = router;