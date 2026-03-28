require("dotenv").config();
const express = require("express");
const cors = require("cors")
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const swaggerDoc = YAML.load("./doc/documentation.yml");

const authRoutes  = require("./router/auth.routes");
const boardRoutes = require("./router/boards.routes");
const taskRoutes  = require("./router/tasks.routes");
const adminRoutes = require("./router/admin.routes");

const app = express();

app.use(cors())
app.use(express.json());
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.use("/api/auth",   authRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/tasks",  taskRoutes);
app.use("/api/admin",  adminRoutes);

// Global error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Server xatosi";
  return res.status(status).json({ message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ${PORT}-portda ishlamoqda`));

