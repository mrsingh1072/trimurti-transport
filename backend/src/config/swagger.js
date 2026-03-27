const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const setupSwagger = (app) => {
  const swaggerPath = path.join(__dirname, 'swagger.yaml');
  const swaggerDocument = YAML.load(swaggerPath);

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

module.exports = { setupSwagger };
