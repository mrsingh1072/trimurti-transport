const paymentService = require('../services/paymentService');

const createPayment = async (req, res) => {
  const payment = await paymentService.createPayment(req.body);
  res.status(201).json({ message: 'Payment recorded', payment });
};

module.exports = { createPayment };
