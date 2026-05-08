const express = require("express");
const {
  loginAdmin,
  registerInitialAdmin,
  getAdminProfile
} = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", loginAdmin);
router.post("/register-initial", registerInitialAdmin);
router.get("/me", verifyToken, getAdminProfile);

module.exports = router;
