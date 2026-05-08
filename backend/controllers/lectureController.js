const Lecture = require("../models/lectureModel");

const getYoutubeId = (url) => {
  const match = String(url || "").match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&?/]+)/i);
  return match ? match[1] : "";
};

const getLectures = async (req, res, next) => {
  try {
    const lectures = await Lecture.getAllLectures({ q: (req.query.q || "").trim(), topic_id: req.query.topic_id });
    res.json(lectures);
  } catch (error) {
    next(error);
  }
};

const createLecture = async (req, res, next) => {
  try {
    const { topic_id, title, youtube_url } = req.body;
    if (!topic_id || !title || !youtube_url) return res.status(400).json({ message: "topic_id, title and youtube_url are required." });
    if (!/^https?:\/\//i.test(youtube_url)) return res.status(400).json({ message: "youtube_url must be a valid URL." });
    const youtubeId = getYoutubeId(youtube_url);
    const thumbnail = req.body.thumbnail || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : "");
    const id = await Lecture.createLecture({ topic_id, title, youtube_url, thumbnail });
    res.status(201).json({ message: "Lecture added successfully", id });
  } catch (error) {
    next(error);
  }
};

const updateLecture = async (req, res, next) => {
  try {
    const { topic_id, title, youtube_url } = req.body;
    if (!topic_id || !title || !youtube_url) return res.status(400).json({ message: "topic_id, title and youtube_url are required." });
    const youtubeId = getYoutubeId(youtube_url);
    const thumbnail = req.body.thumbnail || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : "");
    const affectedRows = await Lecture.updateLecture(req.params.id, { topic_id, title, youtube_url, thumbnail });
    if (!affectedRows) return res.status(404).json({ message: "Lecture not found." });
    res.json({ message: "Lecture updated successfully" });
  } catch (error) {
    next(error);
  }
};

const deleteLecture = async (req, res, next) => {
  try {
    const affectedRows = await Lecture.deleteLecture(req.params.id);
    if (!affectedRows) return res.status(404).json({ message: "Lecture not found." });
    res.json({ message: "Lecture deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLectures, createLecture, updateLecture, deleteLecture };
