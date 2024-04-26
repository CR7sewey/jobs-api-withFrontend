require("dotenv").config();
require("express-async-errors");

const express = require("express");
// DB CONNECTION
const databaseConnection = require("./db/connect");

const app = express();

app.use(express.json());

const jobsMaid = require("./MOCK_DATA.json");
const Job = require("./models/Job");

const start = async () => {
  try {
    // delete all db
    await databaseConnection(process.env.MONGO_URI);
    await Job.deleteMany();
    await Job.create(jobsMaid);
    process.exit(0);
  } catch (error) {
    console.log(error);
  }
};

start();
