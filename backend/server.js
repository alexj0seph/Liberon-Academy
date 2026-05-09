const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const topicRoutes = require("./routes/topicRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const pdfRoutes = require("./routes/pdfRoutes");
const lectureRoutes = require("./routes/lectureRoutes");
const statsRoutes = require("./routes/statsRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { initDatabase } = require("./database/initDb");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "*"
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/admin-login", (req, res) => {
  res.redirect("https://liberonacademy.live/admin-login");
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/admin/admin.html"));
});

app.get("/admin/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/admin/login.html"));
});

app.get("/admin/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/admin/dashboard.html"));
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/pdfs", pdfRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/stats", statsRoutes);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Liberon Academy API running" });
});

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  initDatabase();
});
