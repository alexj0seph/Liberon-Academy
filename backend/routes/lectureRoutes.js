const express = require("express");
const {
  getLectures,
  createLecture,
  updateLecture,
  deleteLecture
} = require("../controllers/lectureController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getLectures);
router.post("/", verifyToken, createLecture);
router.put("/:id", verifyToken, updateLecture);
router.delete("/:id", verifyToken, deleteLecture);

module.exports = router;
