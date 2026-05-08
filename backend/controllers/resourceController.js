const pool = require("../config/db");

const getResources = async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    let sql = "SELECT * FROM resources";
    const params = [];

    if (q) {
      sql += " WHERE title LIKE ? OR category LIKE ?";
      params.push(`%${q}%`, `%${q}%`);
    }

    sql += " ORDER BY created_at DESC";
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

const createResource = async (req, res, next) => {
  try {
    const { title, category } = req.body;
    const pdf_path = req.file ? `/uploads/pdfs/${req.file.filename}` : null;

    if (!title) {
      return res.status(400).json({ message: "title is required." });
    }

    const [result] = await pool.query(
      "INSERT INTO resources (title, category, pdf_path) VALUES (?, ?, ?)",
      [title, category || "General", pdf_path]
    );

    res.status(201).json({
      message: "Resource added successfully",
      id: result.insertId
    });
  } catch (error) {
    next(error);
  }
};

const deleteResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM resources WHERE id = ?", [id]);

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Resource not found." });
    }

    res.json({ message: "Resource deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResources,
  createResource,
  deleteResource
};
