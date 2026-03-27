const validate = (schema) => (req, res, next) => {
  const options = { abortEarly: false, allowUnknown: true, stripUnknown: true };
  const { error, value } = schema.validate(req.body, options);

  if (error) {
    const err = new Error(
      `Validation error: ${error.details.map((x) => x.message).join(', ')}`
    );
    err.statusCode = 400;
    return next(err);
  }

  req.body = value;
  next();
};

module.exports = { validate };
