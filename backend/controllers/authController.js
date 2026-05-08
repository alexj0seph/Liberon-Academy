const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const [admins] = await pool.query("SELECT * FROM admins WHERE email = ?", [email]);
    const admin = admins[0];

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    next(error);
  }
};

const registerInitialAdmin = async (req, res, next) => {
  try {
    const { username, email, password, setup_key } = req.body;

    if (!process.env.ADMIN_SETUP_KEY) {
      return res.status(400).json({ message: "ADMIN_SETUP_KEY is not configured." });
    }

    if (setup_key !== process.env.ADMIN_SETUP_KEY) {
      return res.status(403).json({ message: "Invalid setup key." });
    }

    if (!username || !email || !password) {
      return res.status(400).json({ message: "username, email and password are required." });
    }

    const [existing] = await pool.query("SELECT id FROM admins WHERE email = ?", [email]);
    if (existing.length) {
      return res.status(409).json({ message: "Admin already exists with this email." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO admins (username, email, password) VALUES (?, ?, ?)", [
      username,
      email,
      hashedPassword
    ]);

    res.status(201).json({ message: "Initial admin created successfully." });
  } catch (error) {
    next(error);
  }
};

const getAdminProfile = async (req, res) => {
  res.json({
    message: "Profile fetched",
    admin: req.admin
  });
};

module.exports = { loginAdmin, registerInitialAdmin, getAdminProfile };
