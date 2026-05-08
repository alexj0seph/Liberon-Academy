const express = require("express");
const {
  getTopics,
  createTopic,
  updateTopic,
  deleteTopic
} = require("../controllers/topicController");
const { verifyToken } = require("../middleware/authMiddleware");
const { validateTopicInput } = require("../middleware/validateMiddleware");

const router = express.Router();

router.get("/", getTopics);
router.post("/", verifyToken, validateTopicInput, createTopic);
router.put("/:id", verifyToken, validateTopicInput, updateTopic);
router.delete("/:id", verifyToken, deleteTopic);

module.exports = router;
