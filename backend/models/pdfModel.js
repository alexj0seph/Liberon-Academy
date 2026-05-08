const pool = require("../config/db");

const getAllPdfs = async ({ q = "", subject_id, topic_id } = {}) => {
  const params = [];
  let sql = `
    SELECT pdfs.*, pdfs.uploaded_at AS created_at, subjects.subject_name, subjects.subject_name AS subject_title, topics.topic_name, topics.topic_name AS topic_title
    FROM pdfs
    LEFT JOIN subjects ON pdfs.subject_id = subjects.id
    LEFT JOIN topics ON pdfs.topic_id = topics.id
    WHERE 1 = 1
  `;
  if (subject_id) {
    sql += " AND pdfs.subject_id = ?";
    params.push(subject_id);
  }
  if (topic_id) {
    sql += " AND pdfs.topic_id = ?";
    params.push(topic_id);
  }
  if (q) {
    sql += " AND (pdfs.title LIKE ? OR subjects.subject_name LIKE ? OR topics.topic_name LIKE ?)";
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  sql += " ORDER BY pdfs.uploaded_at DESC";
  const [rows] = await pool.query(sql, params);
  return rows;
};

const createPdf = async ({ subject_id, topic_id, title, file_path }) => {
  const [result] = await pool.query(
    "INSERT INTO pdfs (subject_id, topic_id, title, file_path) VALUES (?, ?, ?, ?)",
    [subject_id || null, topic_id || null, title, file_path]
  );
  return result.insertId;
};

const deletePdf = async (id) => {
  const [result] = await pool.query("DELETE FROM pdfs WHERE id = ?", [id]);
  return result.affectedRows;
};

module.exports = { getAllPdfs, createPdf, deletePdf };
