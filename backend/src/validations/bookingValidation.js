const Joi = require('joi');

const createBookingSchema = Joi.object({
  vehicleId: Joi.string().required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().required(),
});

const cancelBookingSchema = Joi.object({});

module.exports = { createBookingSchema, cancelBookingSchema };
