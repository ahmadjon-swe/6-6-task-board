const router = require("express").Router();
const authentication = require("../middleware/authentication");
const { register, login, logout, deleteAccount } = require("../controller/auth.controller");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authentication, logout);
router.delete("/delete", authentication, deleteAccount);

module.exports = router;