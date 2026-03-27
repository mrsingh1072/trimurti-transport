const Joi = require('joi');

const createVehicleSchema = Joi.object({
  name: Joi.string().required(),
  category: Joi.string().required(),
  pricePerDay: Joi.number().positive().required(),
  availability: Joi.boolean().optional(),
  condition: Joi.string().optional(),
  location: Joi.string().required(),
});

const updateVehicleSchema = Joi.object({
  name: Joi.string().optional(),
  category: Joi.string().optional(),
  pricePerDay: Joi.number().positive().optional(),
  availability: Joi.boolean().optional(),
  condition: Joi.string().optional(),
  location: Joi.string().optional(),
});

module.exports = { createVehicleSchema, updateVehicleSchema };
