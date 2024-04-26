const Job = require("../models/Job");
const { StatusCodes } = require("http-status-codes");
const NotFound = require("../errors/not-found-error");
const BadRequestError = require("../errors/bad-request-error");

const getAllJobs = async (req, res) => {
  // search, status, type, sort filters on the frontend - queries
  const { search, status, jobType, sort } = req.query;
  const queryObj = {
    createdBy: req.user._id,
  };
  if (search) {
    queryObj.position = { $regex: search, $options: "i" };
  }
  if (status !== "all") {
    queryObj.status = status;
  }
  if (jobType !== "all") {
    queryObj.jobType = jobType;
  }
  const sortType = {
    latest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    "a-z": { position: 1 },
    "z-a": { position: -1 },
  };
  console.log(sortType[sort]);
  const jobs = await Job.find({ ...queryObj }).sort(sortType[sort]);

  return res.status(StatusCodes.OK).json({ jobs, count: jobs.length });
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
  const job = await Job.create({ ...req.body, createdBy: id });

  return res.status(StatusCodes.CREATED).json({ job });
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
