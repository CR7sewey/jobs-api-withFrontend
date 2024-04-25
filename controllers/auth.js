const User = require("../models/User");
const BadRequest = require("../errors/bad-request-error");
const UnauthenticatedError = require("../errors/non_authorized-error");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const register = async (req, res) => {
  const { name, email, password } = req.body;
  /* if (!name) {
    throw new BadRequest("You need to provide a name");
  }
  if (!email) {
    throw new BadRequest("You need to provide an email");
  }
  if (!password) {
    throw new BadRequest("You need to provide a password");
  }
  const user_exists = await User.findOne({ email });*/
  //if (user_exists) {
  // already exists in the model!
  // throw new BadRequest("Already exists an user with this email!");
  //}
  const new_user = await User.create({ ...req.body });
  // NOW IT'S ALL VALIDATED!
  const token = new_user.generateToken();
  return res.status(StatusCodes.CREATED).json({ user: { name }, token });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    throw new BadRequest("You need to provide an email");
  }
  if (!password) {
    throw new BadRequest("You need to provide a password");
  }
  const userEmail = await User.findOne({ email });
  if (!userEmail) {
    // already exists in the model!
    throw new UnauthenticatedError("Invalid Credentials!");
  }
  const passwordMatch = await userEmail.validatePassword(password);
  if (!passwordMatch) {
    throw new UnauthenticatedError("Invalid Credentials!");
  }
  const token = userEmail.generateToken();
  return res
    .status(StatusCodes.OK)
    .json({ user: { name: userEmail.name }, token });
};

module.exports = { login, register };
