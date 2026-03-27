const Joi = require('joi');

const processReturnSchema = Joi.object({
  bookingId: Joi.string().required(),
  actualReturnDate: Joi.date().iso().optional(),
  damageDescription: Joi.string().optional(),
  damageCost: Joi.number().min(0).optional(),
  paymentMethod: Joi.string().valid('cash', 'card', 'online').optional(),
});

module.exports = { processReturnSchema };
