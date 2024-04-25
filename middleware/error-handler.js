const CustomAPIError = require("../errors/my-error");
const { StatusCodes } = require("http-status-codes");
const errorHandler = (err, req, res, next) => {
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || "Something went wrong, try again later",
  };
  /*if (err instanceof CustomAPIError) {
    return res.status(err.statusCode).json({ msg: err.message }); // if and isntance of CustomAPIError
  }*/

  if (err.name === "ValidationError") {
    // exemplo email inavlido no registo
    customError.msg = Object.values(err.errors)
      .map((value) => {
        value.message;
      })
      .join(",");
    customError.statusCode = 400;
  }

  if (err.code && err.code === 11000) {
    // email repetido
    customError.msg = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )} field. Please choose another value`;
    customError.statusCode = 400;
  }

  if (err.name === "CastError") {
    // exemplo um id com mais carateres que suposto
    customError.msg = `No item found with id : ${err.value}`;
    customError.statusCode = 404;
  }

  // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err); // 500
  return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandler;
