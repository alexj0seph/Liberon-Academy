const express = require("express");
const { getStats } = require("../controllers/statsController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", verifyToken, getStats);

module.exports = router;
