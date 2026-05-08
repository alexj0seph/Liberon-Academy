const pool = require("../config/db");

const getDashboardStats = async () => {
  const [[subjects], [topics], [pdfs], [lectures]] = await Promise.all([
    pool.query("SELECT COUNT(*) AS total FROM subjects"),
    pool.query("SELECT COUNT(*) AS total FROM topics"),
    pool.query("SELECT COUNT(*) AS total FROM pdfs"),
    pool.query("SELECT COUNT(*) AS total FROM lectures")
  ]);

  return {
    subjects: subjects[0].total,
    topics: topics[0].total,
    pdfs: pdfs[0].total,
    lectures: lectures[0].total
  };
};

module.exports = { getDashboardStats };
