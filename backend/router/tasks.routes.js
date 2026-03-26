const {Router} = require("express")
const { getAllTasks, getOneTask, addTask, updateTask, deleteTask } = require("../controller/tasks.controller")

const taskRouter = Router()

taskRouter.get("/get_all_tasks/:id", getAllTasks)
taskRouter.get("/get_one_task/:id", getOneTask)
taskRouter.post("/add_task/:id", addTask)
taskRouter.put("/update_task/:id", updateTask)
taskRouter.delete("/delete_task/:id", deleteTask)

module.exports = taskRouter