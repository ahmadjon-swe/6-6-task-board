const router = require("express").Router();
const authentication = require("../middleware/authentication");
const { getAllUsers, updateUser, deleteUser } = require("../controller/admin.controller");

router.get("/users",        authentication, getAllUsers);
router.put("/users/:id",    authentication, updateUser);
router.delete("/users/:id", authentication, deleteUser);

module.exports = router;