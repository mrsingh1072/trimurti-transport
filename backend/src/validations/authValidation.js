const Joi = require('joi');
const { USER_ROLES } = require('../config/constants');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional(),
  password: Joi.string().min(6).required(),
  role: Joi.string()
    .valid(...Object.values(USER_ROLES))
    .optional()
    .default(USER_ROLES.CUSTOMER),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

module.exports = { registerSchema, loginSchema };
