const BadRequest = require("../errors/bad-request-error");
const testUserMiddleware = (req, res, next) => {
  if (req.testUser) {
    throw new BadRequest("Test User. Read Only!");
  }
  next();
};

module.exports = testUserMiddleware;
