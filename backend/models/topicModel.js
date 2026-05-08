const pool = require("../config/db");

const topicSelect = `
  topics.id,
  topics.subject_id,
  topics.topic_name,
  topics.topic_name AS title,
  topics.description,
  topics.youtube_link,
  topics.order_index,
  topics.created_at,
  subjects.subject_name,
  subjects.subject_name AS subject_title
`;

const getAllTopics = async ({ q = "", subject_id } = {}) => {
  const params = [];
  let sql = `SELECT ${topicSelect} FROM topics INNER JOIN subjects ON topics.subject_id = subjects.id WHERE 1 = 1`;
  if (subject_id) {
    sql += " AND topics.subject_id = ?";
    params.push(subject_id);
  }
  if (q) {
    sql += " AND (topics.topic_name LIKE ? OR topics.description LIKE ? OR subjects.subject_name LIKE ?)";
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  sql += " ORDER BY topics.order_index ASC, topics.created_at DESC";
  const [rows] = await pool.query(sql, params);
  return rows;
};

const createTopic = async ({ subject_id, title, topic_name, description, youtube_link, order_index }) => {
  const name = title || topic_name;
  const [result] = await pool.query(
    "INSERT INTO topics (subject_id, topic_name, description, youtube_link, order_index) VALUES (?, ?, ?, ?, ?)",
    [subject_id, name, description || "", youtube_link || "", Number(order_index) || 0]
  );
  return result.insertId;
};

const updateTopic = async (id, { subject_id, title, topic_name, description, youtube_link, order_index }) => {
  const name = title || topic_name;
  const [result] = await pool.query(
    "UPDATE topics SET subject_id = ?, topic_name = ?, description = ?, youtube_link = ?, order_index = ? WHERE id = ?",
    [subject_id, name, description || "", youtube_link || "", Number(order_index) || 0, id]
  );
  return result.affectedRows;
};

const deleteTopic = async (id) => {
  const [result] = await pool.query("DELETE FROM topics WHERE id = ?", [id]);
  return result.affectedRows;
};

module.exports = { getAllTopics, createTopic, updateTopic, deleteTopic };
