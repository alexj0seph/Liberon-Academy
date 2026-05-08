const bcrypt = require("bcrypt");
const pool = require("../config/db");

const sampleSubjects = [
  {
    subject_name: "Indian Polity",
    description: "Constitution, Fundamental Rights, DPSP, Parliament, Judiciary, and more.",
    icon: "⚖"
  },
  {
    subject_name: "Indian Economy",
    description: "Economic concepts, planning, budgeting, and economic reforms.",
    icon: "📈"
  },
  {
    subject_name: "Indian History",
    description: "Ancient, Medieval, and Modern Indian History.",
    icon: "🏛"
  }
];

const sampleTopics = [
  {
    subject_name: "Indian Polity",
    topic_name: "Fundamental Rights",
    description: "Important rights in Part III of the Constitution."
  },
  {
    subject_name: "Indian Economy",
    topic_name: "Budget Basics",
    description: "Union budget structure and key economic terms."
  },
  {
    subject_name: "Indian History",
    topic_name: "Modern India Overview",
    description: "Important phases from 1757 to 1947."
  }
];

const sampleLectures = [
  {
    title: "UPSC Polity Lecture",
    youtube_url: "https://youtube.com/@liberonacademy?si=1M3FApvLAsnJNAch"
  },
  {
    title: "UPSC Economy Lecture",
    youtube_url: "https://youtube.com/@liberonacademy?si=1M3FApvLAsnJNAch"
  }
];

const safeAlter = async (sql) => {
  try {
    await pool.query(sql);
  } catch (error) {
    if (!["ER_DUP_FIELDNAME", "ER_DUP_KEYNAME", "ER_FK_DUP_NAME"].includes(error.code)) {
      throw error;
    }
  }
};

const ensureTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS subjects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      subject_name VARCHAR(150) NOT NULL,
      description TEXT,
      icon VARCHAR(50),
      color VARCHAR(30) DEFAULT '#1f45b5',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await safeAlter("ALTER TABLE subjects ADD COLUMN color VARCHAR(30) DEFAULT '#1f45b5'");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS topics (
      id INT AUTO_INCREMENT PRIMARY KEY,
      subject_id INT NOT NULL,
      topic_name VARCHAR(200) NOT NULL,
      description TEXT,
      youtube_link VARCHAR(255),
      order_index INT DEFAULT 0,
      pdf_file VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_topics_subject
        FOREIGN KEY (subject_id) REFERENCES subjects(id)
        ON DELETE CASCADE
    )
  `);

  await safeAlter("ALTER TABLE topics ADD COLUMN order_index INT DEFAULT 0");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pdfs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      subject_id INT NULL,
      topic_id INT NULL,
      title VARCHAR(200) NOT NULL,
      file_path VARCHAR(255),
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_pdfs_subject
        FOREIGN KEY (subject_id) REFERENCES subjects(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_pdfs_topic
        FOREIGN KEY (topic_id) REFERENCES topics(id)
        ON DELETE SET NULL
    )
  `);

  await safeAlter("ALTER TABLE pdfs ADD COLUMN subject_id INT NULL");
  await safeAlter("ALTER TABLE pdfs ADD COLUMN topic_id INT NULL");
  await safeAlter("ALTER TABLE pdfs ADD COLUMN category VARCHAR(120) NULL");
  await safeAlter("ALTER TABLE pdfs MODIFY category VARCHAR(120) NULL");
  await safeAlter("ALTER TABLE pdfs ADD COLUMN uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
  await safeAlter("ALTER TABLE pdfs ADD CONSTRAINT fk_pdfs_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE");
  await safeAlter("ALTER TABLE pdfs ADD CONSTRAINT fk_pdfs_topic FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS lectures (
      id INT AUTO_INCREMENT PRIMARY KEY,
      topic_id INT NULL,
      title VARCHAR(200) NOT NULL,
      youtube_url VARCHAR(255) NOT NULL,
      thumbnail VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_lectures_topic
        FOREIGN KEY (topic_id) REFERENCES topics(id)
        ON DELETE CASCADE
    )
  `);

  await safeAlter("ALTER TABLE lectures ADD COLUMN topic_id INT NULL");
  await safeAlter("ALTER TABLE lectures ADD COLUMN thumbnail VARCHAR(255)");
  await safeAlter("ALTER TABLE lectures ADD CONSTRAINT fk_lectures_topic FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE");
};

const seedSubjectsIfEmpty = async () => {
  const [rows] = await pool.query("SELECT COUNT(*) AS count FROM subjects");
  const count = rows[0]?.count || 0;

  if (count > 0) {
    return;
  }

  for (const subject of sampleSubjects) {
    await pool.query(
      "INSERT INTO subjects (subject_name, description, icon, color) VALUES (?, ?, ?, ?)",
      [subject.subject_name, subject.description, subject.icon, "#1f45b5"]
    );
  }

  console.log("[DB] Seeded default UPSC subjects.");
};

const seedTopicsIfEmpty = async () => {
  const [rows] = await pool.query("SELECT COUNT(*) AS count FROM topics");
  const count = rows[0]?.count || 0;
  if (count > 0) return;

  for (const topic of sampleTopics) {
    const [subjectRows] = await pool.query("SELECT id FROM subjects WHERE subject_name = ?", [
      topic.subject_name
    ]);
    const subjectId = subjectRows[0]?.id;
    if (!subjectId) continue;

    await pool.query(
      "INSERT INTO topics (subject_id, topic_name, description, youtube_link, order_index) VALUES (?, ?, ?, ?, ?)",
      [subjectId, topic.topic_name, topic.description, "", 0]
    );
  }
  console.log("[DB] Seeded default UPSC topics.");
};

const seedPdfsIfEmpty = async () => {
  const [rows] = await pool.query("SELECT COUNT(*) AS count FROM pdfs");
  const count = rows[0]?.count || 0;
  if (count > 0) return;

  const [subjectRows] = await pool.query("SELECT id FROM subjects ORDER BY id ASC LIMIT 1");
  const defaultSubjectId = subjectRows[0]?.id || null;
  await pool.query(
    "INSERT INTO pdfs (subject_id, title, file_path) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)",
    [
      defaultSubjectId,
      "UPSC Polity Notes",
      null,
      defaultSubjectId,
      "UPSC Economy Notes",
      null,
      defaultSubjectId,
      "UPSC Previous Year Questions",
      null
    ]
  );
  console.log("[DB] Seeded default PDFs metadata.");
};

const seedLecturesIfEmpty = async () => {
  const [rows] = await pool.query("SELECT COUNT(*) AS count FROM lectures");
  const count = rows[0]?.count || 0;
  if (count > 0) return;

  const [topicRows] = await pool.query("SELECT id FROM topics ORDER BY id ASC LIMIT 1");
  const defaultTopicId = topicRows[0]?.id || null;

  for (const lecture of sampleLectures) {
    await pool.query(
      "INSERT INTO lectures (topic_id, title, youtube_url, thumbnail) VALUES (?, ?, ?, ?)",
      [defaultTopicId, lecture.title, lecture.youtube_url, ""]
    );
  }
  console.log("[DB] Seeded default lectures.");
};

const seedAdminIfEmpty = async () => {
  const [rows] = await pool.query("SELECT COUNT(*) AS count FROM admins");
  const count = rows[0]?.count || 0;
  if (count > 0) return;

  const username = process.env.ADMIN_SEED_USERNAME || "admin";
  const email = process.env.ADMIN_SEED_EMAIL || "admin@liberonacademy.live";
  const plainPassword = process.env.ADMIN_SEED_PASSWORD || "admin123";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  await pool.query("INSERT INTO admins (username, email, password) VALUES (?, ?, ?)", [
    username,
    email,
    hashedPassword
  ]);
  console.log("[DB] Seeded default admin account.");
};

const initDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    await ensureTables();
    await seedSubjectsIfEmpty();
    await seedTopicsIfEmpty();
    await seedPdfsIfEmpty();
    await seedLecturesIfEmpty();
    await seedAdminIfEmpty();
    console.log("[DB] Connected and ready.");
  } catch (error) {
    console.error("[DB] Initialization failed:", error.message);
  }
};

module.exports = { initDatabase, sampleSubjects };
