const express = require("express");
const { getPdfs, createPdf, deletePdf } = require("../controllers/pdfController");
const { verifyToken } = require("../middleware/authMiddleware");
const { uploadPdf } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getPdfs);
router.post("/", verifyToken, uploadPdf.single("pdf_file"), createPdf);
router.delete("/:id", verifyToken, deletePdf);

module.exports = router;
