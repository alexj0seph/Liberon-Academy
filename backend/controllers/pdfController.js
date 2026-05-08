const Pdf = require("../models/pdfModel");

const getPdfs = async (req, res, next) => {
  try {
    const pdfs = await Pdf.getAllPdfs({ q: (req.query.q || "").trim(), subject_id: req.query.subject_id, topic_id: req.query.topic_id });
    res.json(pdfs);
  } catch (error) {
    next(error);
  }
};

const createPdf = async (req, res, next) => {
  try {
    const { subject_id, topic_id, title } = req.body;
    const file_path = req.file ? `/uploads/pdfs/${req.file.filename}` : null;
    if (!subject_id || !title || !file_path) return res.status(400).json({ message: "subject_id, title and pdf_file are required." });
    const id = await Pdf.createPdf({ subject_id, topic_id, title, file_path });
    res.status(201).json({ message: "PDF uploaded successfully", id, file_path });
  } catch (error) {
    next(error);
  }
};

const deletePdf = async (req, res, next) => {
  try {
    const affectedRows = await Pdf.deletePdf(req.params.id);
    if (!affectedRows) return res.status(404).json({ message: "PDF entry not found." });
    res.json({ message: "PDF entry deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPdfs, createPdf, deletePdf };
