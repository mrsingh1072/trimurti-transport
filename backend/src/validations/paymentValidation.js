const Joi = require('joi');

const createPaymentSchema = Joi.object({
  bookingId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  method: Joi.string().valid('cash', 'card', 'online').required(),
});

module.exports = { createPaymentSchema };
