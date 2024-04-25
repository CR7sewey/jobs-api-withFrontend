const CustomAPIError = require("./my-error");
const { StatusCodes } = require("http-status-codes");
class NotFound extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.NOT_FOUND; //404
  }
}

module.exports = NotFound;
