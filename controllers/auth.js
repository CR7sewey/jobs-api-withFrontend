const User = require("../models/User");
const BadRequest = require("../errors/bad-request-error");
const UnauthenticatedError = require("../errors/non_authorized-error");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const register = async (req, res) => {
  const { name, email, location, lastName } = req.body;
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
  return res.status(StatusCodes.CREATED).json({
    user: {
      email,
      lastName,
      location,
      name,
      token,
    },
  });
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
  return res.status(StatusCodes.OK).json({
    user: {
      email,
      lastName: userEmail.lastName,
      location: userEmail.location,
      name: userEmail.name,
      token,
    },
  });
};

const updateUser = async (req, res) => {
  const { email, lastName, name, location } = req.body;
  console.log(email);
  if (!email || !name || !lastName || !location) {
    throw new BadRequest("Please provide all values");
  }
  const user = await User.findOneAndUpdate(
    { email: req.user.email },
    { email, lastName, name, location }
  );

  /*const user = await User.findOne({ _id: req.user._id });
  console.log("aqui");
  console.log(user);

  user.email = email;
  console.log("aqui2");
  user.name = name;
  user.lastName = lastName;
  user.location = location;
  console.log("aqui3");

  await user.save();
  console.log("aqui3");*/
  const token = user.generateToken();
  return res.status(StatusCodes.OK).json({
    user: {
      email,
      lastName,
      location,
      name,
      token,
    },
  });
};

module.exports = { login, register, updateUser };
