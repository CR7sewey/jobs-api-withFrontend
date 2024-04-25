const CustomAPIError = require("./my-error");
const { StatusCodes } = require("http-status-codes");

class UnauthenticatedError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED; //401
  }
}

module.exports = UnauthenticatedError;
