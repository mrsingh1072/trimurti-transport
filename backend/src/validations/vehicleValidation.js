const Joi = require('joi');

const createVehicleSchema = Joi.object({
  name: Joi.string().trim().required(),
  category: Joi.string()
    .valid('Car', 'Bike', 'Truck', 'Bus', 'Tractor', 'JCB')
    .required(),
  pricePerDay: Joi.number().positive().required(),
  availability: Joi.boolean().optional().default(true),
  condition: Joi.string()
    .valid('Good', 'Average', 'Poor')
    .optional()
    .default('Good'),
  location: Joi.string().trim().required(),
});

const updateVehicleSchema = Joi.object({
  name: Joi.string().trim().optional(),
  category: Joi.string()
    .valid('Car', 'Bike', 'Truck', 'Bus', 'Tractor', 'JCB')
    .optional(),
  pricePerDay: Joi.number().positive().optional(),
  availability: Joi.boolean().optional(),
  condition: Joi.string()
    .valid('Good', 'Average', 'Poor')
    .optional(),
  location: Joi.string().trim().optional(),
});

module.exports = { createVehicleSchema, updateVehicleSchema };
