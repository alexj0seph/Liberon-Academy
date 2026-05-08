const Topic = require("../models/topicModel");

const getTopics = async (req, res, next) => {
  try {
    const topics = await Topic.getAllTopics({ q: (req.query.q || "").trim(), subject_id: req.query.subject_id });
    res.json(topics);
  } catch (error) {
    next(error);
  }
};

const createTopic = async (req, res, next) => {
  try {
    const title = req.body.title || req.body.topic_name;
    if (!req.body.subject_id || !title) return res.status(400).json({ message: "subject_id and title are required." });
    const id = await Topic.createTopic({ ...req.body, title });
    res.status(201).json({ message: "Topic created successfully", id });
  } catch (error) {
    next(error);
  }
};

const updateTopic = async (req, res, next) => {
  try {
    const title = req.body.title || req.body.topic_name;
    if (!req.body.subject_id || !title) return res.status(400).json({ message: "subject_id and title are required." });
    const affectedRows = await Topic.updateTopic(req.params.id, { ...req.body, title });
    if (!affectedRows) return res.status(404).json({ message: "Topic not found." });
    res.json({ message: "Topic updated successfully" });
  } catch (error) {
    next(error);
  }
};

const deleteTopic = async (req, res, next) => {
  try {
    const affectedRows = await Topic.deleteTopic(req.params.id);
    if (!affectedRows) return res.status(404).json({ message: "Topic not found." });
    res.json({ message: "Topic deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTopics, createTopic, updateTopic, deleteTopic };
