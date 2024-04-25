const express = require("express");
const router = express.Router();
const { login, register, updateUser } = require("../controllers/auth");
const tokenVerification = require("../middleware/authentication");

router.post("/register", register);
router.post("/login", login);
router.patch("/updateUser", tokenVerification, updateUser);

module.exports = router;
