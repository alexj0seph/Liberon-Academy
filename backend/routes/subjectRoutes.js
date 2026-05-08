const express = require("express");
const {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject
} = require("../controllers/subjectController");
const { verifyToken } = require("../middleware/authMiddleware");
const { validateSubjectInput } = require("../middleware/validateMiddleware");

const router = express.Router();

router.get("/", getSubjects);
router.post("/", verifyToken, validateSubjectInput, createSubject);
router.put("/:id", verifyToken, validateSubjectInput, updateSubject);
router.delete("/:id", verifyToken, deleteSubject);

module.exports = router;
