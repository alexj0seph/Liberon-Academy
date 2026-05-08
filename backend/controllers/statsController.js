const Stats = require("../models/statsModel");

const getStats = async (req, res, next) => {
  try {
    res.json(await Stats.getDashboardStats());
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats };
