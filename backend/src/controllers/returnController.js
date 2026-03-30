const returnService = require('../services/returnService');

const processReturn = async (req, res) => {
  const result = await returnService.processReturn(req.body);
  res.status(201).json({ message: 'Return processed', ...result });
};

const getReturns = async (req, res) => {
  const returns = await returnService.getReturns();
  res.json({ returns });
};

const getReturnStats = async (req, res) => {
  const stats = await returnService.getReturnStats();
  res.json(stats);
};

module.exports = { processReturn, getReturns, getReturnStats };
