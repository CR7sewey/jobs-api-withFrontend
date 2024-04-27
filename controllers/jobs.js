const Job = require("../models/Job");
const { StatusCodes } = require("http-status-codes");
const NotFound = require("../errors/not-found-error");
const BadRequestError = require("../errors/bad-request-error");
const moment = require("moment");

const months = {
  12: "Dec",
  11: "Nov",
  10: "Out",
  9: "Set",
  8: "Aug",
  7: "Jul",
  6: "Jun",
  5: "May",
  4: "Apr",
  3: "Mar",
  2: "Feb",
  1: "Jan",
};

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
//https://mongoosejs.com/docs/api/aggregate.html
const statsJobs = async (req, res) => {
  // DEFAULT STATS
  // as it stands, we query the db to give us an array [{_id: declined, count: x}, ...]
  const data = await Job.aggregate([
    //mongoose.Types.ObjectId
    { $match: { createdBy: req.user._id } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  console.log(data);
  /*stats = stats.reduce((acc, curr) => {
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, {});*/
  let defaultStats = {};
  data.map((value) => {
    defaultStats[value._id] = value.count || 0;
  });
  console.log("data", data);
  // MONTHLY APPLICATIONS
  // last six months,
  const data2 = await Job.aggregate([
    { $match: { createdBy: req.user._id } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": -1, "_id.month": -1 }, // sort by year and mtonh desc
    },
    {
      $limit: 6, // last 6 months
    },
  ]);
  console.log(data2);
  /*let monthlyApplications = data2.map((value) => {
    let temporaryObj = {};
    temporaryObj.date = `${value._id.year} - ${months[value._id.month]}`;
    temporaryObj.count = value.count;
    return temporaryObj;
  });
  monthlyApplications = monthlyApplications.reverse();
  console.log(monthlyApplications);

  return res.status(StatusCodes.OK).json({
    defaultStats,
    monthlyApplications,
  });*/

  let monthlyApplications = data2.map((value) => {
    //temporaryObj[`${value._id.year} - ${months[value._id.month]}`] = value.count;
    date = moment()
      .month(value._id.month - 1)
      .year(value._id.year)
      .format("MMM Y");
    return { date, count: value.count };
  });
  monthlyApplications = monthlyApplications.reverse();
  console.log(monthlyApplications);
  return res.status(StatusCodes.OK).json({
    defaultStats,
    monthlyApplications,
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
