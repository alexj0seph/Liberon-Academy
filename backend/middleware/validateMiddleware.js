const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const validateSubjectInput = (req, res, next) => {
  if (!isNonEmptyString(req.body.subject_name) && !isNonEmptyString(req.body.title)) {
    return res.status(400).json({ message: "title is required." });
  }
  next();
};

const validateTopicInput = (req, res, next) => {
  const { subject_id, topic_name, title, youtube_link } = req.body;

  if (!subject_id || Number.isNaN(Number(subject_id))) {
    return res.status(400).json({ message: "Valid subject_id is required." });
  }
  if (!isNonEmptyString(topic_name) && !isNonEmptyString(title)) {
    return res.status(400).json({ message: "title is required." });
  }
  if (youtube_link && !/^https?:\/\//i.test(youtube_link)) {
    return res.status(400).json({ message: "youtube_link must be a valid URL." });
  }
  next();
};

const validateResourceInput = (req, res, next) => {
  if (!isNonEmptyString(req.body.title)) {
    return res.status(400).json({ message: "title is required." });
  }
  next();
};

module.exports = {
  validateSubjectInput,
  validateTopicInput,
  validateResourceInput
};
