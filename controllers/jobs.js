const Job = require("../models/Job");
const { StatusCodes } = require("http-status-codes");
const NotFound = require("../errors/not-found-error");
const BadRequestError = require("../errors/bad-request-error");
const mongoose = require("mongoose");

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
  let jobs = Job.find({ ...queryObj }).sort(sortType[sort]);

  // in the request for seeing the second page of pagination the page is 2 and so on!
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  jobs = jobs.skip(skip).limit(limit);

  jobs = await jobs;

  // to send to the frontend (for pagination!)
  const totalJobs = await Job.countDocuments(queryObj); // coutn number of jobs with query obj (Similar to find(queryObj).length())
  const numOfPages = Math.ceil(totalJobs / limit);

  return res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages });
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

//https://www.mongodb.com/docs/manual/core/aggregation-pipeline/
const statsJobs = async (req, res) => {
  // as it stands, we query the db to give us an array [{_id: declined, count: x}, ...]
  const data = await Job.aggregate([
    //mongoose.Types.ObjectId
    { $match: { createdBy: req.user._id } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  console.log(data);
  let defaultStats = {};
  data.map((value) => {
    defaultStats[value._id] = value.count;
  });
  return res.status(StatusCodes.OK).json({
    defaultStats,
    monthlyApplications: [data],
  });
};

module.exports = {
  getJob,
  getAllJobs,
  createJob,
  updateJob,
  deleteJob,
  statsJobs,
};
