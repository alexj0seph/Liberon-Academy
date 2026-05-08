const pool = require("../config/db");

const subjectSelect = "id, subject_name, subject_name AS title, description, icon, color, created_at";

const getAllSubjects = async (q = "") => {
  const params = [];
  let sql = `SELECT ${subjectSelect} FROM subjects`;
  if (q) {
    sql += " WHERE subject_name LIKE ? OR description LIKE ?";
    params.push(`%${q}%`, `%${q}%`);
  }
  sql += " ORDER BY created_at DESC";
  const [rows] = await pool.query(sql, params);
  return rows;
};

const createSubject = async ({ title, subject_name, description, icon, color }) => {
  const name = title || subject_name;
  const [result] = await pool.query(
    "INSERT INTO subjects (subject_name, description, icon, color) VALUES (?, ?, ?, ?)",
    [name, description || "", icon || "", color || "#1f45b5"]
  );
  return result.insertId;
};

const updateSubject = async (id, { title, subject_name, description, icon, color }) => {
  const name = title || subject_name;
  const [result] = await pool.query(
    "UPDATE subjects SET subject_name = ?, description = ?, icon = ?, color = ? WHERE id = ?",
    [name, description || "", icon || "", color || "#1f45b5", id]
  );
  return result.affectedRows;
};

const deleteSubject = async (id) => {
  const [result] = await pool.query("DELETE FROM subjects WHERE id = ?", [id]);
  return result.affectedRows;
};

module.exports = { getAllSubjects, createSubject, updateSubject, deleteSubject };
