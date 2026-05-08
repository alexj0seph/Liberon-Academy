const { sampleSubjects } = require("../database/initDb");
const Subject = require("../models/subjectModel");

const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.getAllSubjects((req.query.q || "").trim());
    res.json(subjects);
  } catch (error) {
    console.error("[API] /api/subjects failed:", error.message);
    res.status(200).json(sampleSubjects.map((item, index) => ({ id: index + 1, title: item.subject_name, ...item, color: "#1f45b5" })));
  }
};

const createSubject = async (req, res, next) => {
  try {
    const title = req.body.title || req.body.subject_name;
    if (!title) return res.status(400).json({ message: "title is required." });
    const id = await Subject.createSubject({ ...req.body, title });
    res.status(201).json({ message: "Subject added successfully", id });
  } catch (error) {
    next(error);
  }
};

const updateSubject = async (req, res, next) => {
  try {
    const title = req.body.title || req.body.subject_name;
    if (!title) return res.status(400).json({ message: "title is required." });
    const affectedRows = await Subject.updateSubject(req.params.id, { ...req.body, title });
    if (!affectedRows) return res.status(404).json({ message: "Subject not found." });
    res.json({ message: "Subject updated successfully" });
  } catch (error) {
    next(error);
  }
};

const deleteSubject = async (req, res, next) => {
  try {
    const affectedRows = await Subject.deleteSubject(req.params.id);
    if (!affectedRows) return res.status(404).json({ message: "Subject not found." });
    res.json({ message: "Subject deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSubjects, createSubject, updateSubject, deleteSubject };
