const pool = require("../config/db");

const getAllLectures = async ({ q = "", topic_id } = {}) => {
  const params = [];
  let sql = `
    SELECT lectures.*, topics.topic_name, topics.topic_name AS topic_title, topics.subject_id, subjects.subject_name, subjects.subject_name AS subject_title
    FROM lectures
    LEFT JOIN topics ON lectures.topic_id = topics.id
    LEFT JOIN subjects ON topics.subject_id = subjects.id
    WHERE 1 = 1
  `;
  if (topic_id) {
    sql += " AND lectures.topic_id = ?";
    params.push(topic_id);
  }
  if (q) {
    sql += " AND (lectures.title LIKE ? OR lectures.youtube_url LIKE ? OR topics.topic_name LIKE ?)";
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  sql += " ORDER BY lectures.created_at DESC";
  const [rows] = await pool.query(sql, params);
  return rows;
};

const createLecture = async ({ topic_id, title, youtube_url, thumbnail }) => {
  const [result] = await pool.query(
    "INSERT INTO lectures (topic_id, title, youtube_url, thumbnail) VALUES (?, ?, ?, ?)",
    [topic_id || null, title, youtube_url, thumbnail || ""]
  );
  return result.insertId;
};

const updateLecture = async (id, { topic_id, title, youtube_url, thumbnail }) => {
  const [result] = await pool.query(
    "UPDATE lectures SET topic_id = ?, title = ?, youtube_url = ?, thumbnail = ? WHERE id = ?",
    [topic_id || null, title, youtube_url, thumbnail || "", id]
  );
  return result.affectedRows;
};

const deleteLecture = async (id) => {
  const [result] = await pool.query("DELETE FROM lectures WHERE id = ?", [id]);
  return result.affectedRows;
};

module.exports = { getAllLectures, createLecture, updateLecture, deleteLecture };
