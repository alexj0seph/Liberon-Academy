const express = require("express");
const {
  getResources,
  createResource,
  deleteResource
} = require("../controllers/resourceController");
const { verifyToken } = require("../middleware/authMiddleware");
const { uploadPdf } = require("../middleware/uploadMiddleware");
const { validateResourceInput } = require("../middleware/validateMiddleware");

const router = express.Router();

router.get("/", getResources);
router.post("/", verifyToken, uploadPdf.single("pdf_path"), validateResourceInput, createResource);
router.delete("/:id", verifyToken, deleteResource);

module.exports = router;
