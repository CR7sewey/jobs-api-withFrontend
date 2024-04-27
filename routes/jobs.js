const express = require("express");
const router = express.Router();
const testUserMiddleware = require("../middleware/test-user");
const {
  getJob,
  getAllJobs,
  createJob,
  updateJob,
  deleteJob,
  statsJobs,
} = require("../controllers/jobs");

router.get("/", getAllJobs);
router.get("/stats", statsJobs);
router.get("/:id", getJob);
router.post("/", testUserMiddleware, createJob);
router.patch("/:id", testUserMiddleware, updateJob);
router.delete("/:id", testUserMiddleware, deleteJob);

module.exports = router;
