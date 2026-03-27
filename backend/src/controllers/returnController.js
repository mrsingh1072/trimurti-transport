const returnService = require('../services/returnService');

const processReturn = async (req, res) => {
  const result = await returnService.processReturn(req.body);
  res.status(201).json({ message: 'Return processed', ...result });
};

module.exports = { processReturn };
