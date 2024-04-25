const CustomAPIError = require("./my-error");
const { StatusCodes } = require("http-status-codes");
class BadRequest extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.BAD_REQUEST; //400
  }
}

module.exports = BadRequest;
