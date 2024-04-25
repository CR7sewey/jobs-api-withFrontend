const Job = require("../models/Job");
const { StatusCodes } = require("http-status-codes");
const NotFound = require("../errors/not-found-error");
const BadRequestError = require("../errors/bad-request-error");

const getAllJobs = async (req, res) => {
  const all_jobs = await Job.find({ createdBy: req.user._id }).sort({
    createdBy: -1,
  });
  return res.status(StatusCodes.OK).json({ all_jobs });
};

const getJob = async (req, res) => {
  const createdBy = req.user._id;
  const { id } = req.params;
  const job = await Job.findOne({ createdBy, _id: id });
  if (!job) {
    throw new NotFound("You dont have a job registered with this id");
  }
  return res.status(StatusCodes.OK).json({ job });
};

const createJob = async (req, res) => {
  console.log(req.user);
  const { _id: id } = req.user;
  if (!id) {
    throw new Error("Well not supposed to be here!");
  }
  const new_job = await Job.create({ ...req.body, createdBy: id });

  return res.status(StatusCodes.CREATED).json({ new_job });
};

const updateJob = async (req, res) => {
  const createdBy = req.user._id;
  const { id } = req.params;
  if (
    typeof req.body.company === "undefined" ||
    typeof req.body.position === "undefined"
  ) {
    throw new BadRequestError("Company or Position fields cannot be empty");
  }

  const job = await Job.findByIdAndUpdate({ createdBy, _id: id }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!job) {
    throw new NotFound("You dont have a job registered with this id");
  }
  return res.status(StatusCodes.OK).json({ job });
};

const deleteJob = async (req, res) => {
  const createdBy = req.user._id;
  const { id } = req.params;
  const job = await Job.findByIdAndDelete({ createdBy, _id: id });
  if (!job) {
    throw new NotFound("You didnt eliminate any job");
  }
  return res.status(StatusCodes.OK).json({ job });
};

module.exports = { getJob, getAllJobs, createJob, updateJob, deleteJob };
