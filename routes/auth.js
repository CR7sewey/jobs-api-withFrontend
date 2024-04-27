const express = require("express");
const router = express.Router();
const { login, register, updateUser } = require("../controllers/auth");
const tokenVerification = require("../middleware/authentication");
const testUserMiddleware = require("../middleware/test-user");

const rateLimiter = require("express-rate-limit");
const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    msg: "To many requests from this IP, please try again after 15 minutes",
  },
});

router.post("/register", apiLimiter, register);
router.post("/login", apiLimiter, login);
router.patch("/updateUser", tokenVerification, testUserMiddleware, updateUser);

module.exports = router;
