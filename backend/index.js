const express = require("express")
const cors = require("cors")
const boardRouter = require("./router/boards.routes")
const taskRouter = require("./router/tasks.routes")
// DOCUMENTATION UCHUN
const swaggerUi = require("swagger-ui-express")
const YAML = require("yamljs")

const swaggerDoc = YAML.load("./doc/documentation.yml")

const app = express()
app.use(cors())
app.use(express.json())
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc))

// ROUTERS
app.use(boardRouter)
app.use(taskRouter)

app.listen(4001, () => {
  console.log("listening at: 4001")
})