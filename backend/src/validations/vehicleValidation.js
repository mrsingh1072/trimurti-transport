const Joi = require('joi');

const createVehicleSchema = Joi.object({
  name: Joi.string().trim().required(),
  category: Joi.string()
    .valid('Car', 'Bike', 'Truck', 'Bus', 'Tractor', 'JCB')
    .required(),
  pricePerDay: Joi.number().min(500).required(),
  availability: Joi.boolean().optional().default(true),
  condition: Joi.string()
    .valid('Excellent', 'Good', 'Fair')
    .optional()
    .default('Good'),
  location: Joi.string().trim().required(),
  isDeleted: Joi.boolean().optional().default(false),
});

const updateVehicleSchema = Joi.object({
  name: Joi.string().trim().optional(),
  category: Joi.string()
    .valid('Car', 'Bike', 'Truck', 'Bus', 'Tractor', 'JCB')
    .optional(),
  pricePerDay: Joi.number().min(500).optional(),
  availability: Joi.boolean().optional(),
  condition: Joi.string()
    .valid('Excellent', 'Good', 'Fair')
    .optional(),
  location: Joi.string().trim().optional(),
  isDeleted: Joi.boolean().optional(),
});

module.exports = { createVehicleSchema, updateVehicleSchema };
