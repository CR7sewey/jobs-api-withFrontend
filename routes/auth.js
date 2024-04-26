const express = require("express");
const router = express.Router();
const { login, register, updateUser } = require("../controllers/auth");
const tokenVerification = require("../middleware/authentication");
const testUserMiddleware = require("../middleware/test-user");

router.post("/register", register);
router.post("/login", login);
router.patch("/updateUser", tokenVerification, testUserMiddleware, updateUser);

module.exports = router;
