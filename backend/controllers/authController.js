const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log("[AUTH] Login attempt received:", {
      email,
      hasPassword: Boolean(password),
      mysqlHostConfigured: Boolean(process.env.MYSQLHOST),
      mysqlDatabaseConfigured: Boolean(process.env.MYSQLDATABASE),
      jwtSecretConfigured: Boolean(process.env.JWT_SECRET)
    });

    if (!email || !password) {
      console.log("[AUTH] Login rejected: missing email or password.");
      return res.status(400).json({ message: "Email and password are required." });
    }

    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log("[AUTH] Database connection ping successful.");

    const [tableRows] = await pool.query("SHOW TABLES LIKE 'admins'");
    console.log("[AUTH] Admins table check:", { exists: tableRows.length > 0 });

    const [admins] = await pool.query("SELECT * FROM admins WHERE email = ?", [email]);
    const admin = admins[0];
    console.log("[AUTH] Admin lookup complete:", { found: Boolean(admin), count: admins.length });

    if (!admin) {
      console.log("[AUTH] Login rejected: admin not found.");
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    console.log("[AUTH] Password comparison complete:", { passwordMatch });

    if (!passwordMatch) {
      console.log("[AUTH] Login rejected: password mismatch.");
      return res.status(401).json({ message: "Invalid credentials." });
    }

    if (!process.env.JWT_SECRET) {
      console.log("[AUTH] Login failed: JWT_SECRET is missing.");
      return res.status(500).json({ message: "JWT secret is not configured." });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );
    console.log("[AUTH] Login successful:", { adminId: admin.id, email: admin.email });

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
    console.error("[AUTH] Login error:", error);
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
