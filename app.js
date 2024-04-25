require("dotenv").config();
require("express-async-errors");

// extra security packages
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");

const express = require("express");
// DB CONNECTION
const databaseConnection = require("./db/connect");

// MIDDLEWARES
const errorHandler = require("./middleware/error-handler");
const notFoundMiddleware = require("./middleware/not-found");
const tokenVerification = require("./middleware/authentication");

// ROUTERS
const routerAuth = require("./routes/auth");
const routerJobs = require("./routes/jobs");

const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());
app.search("trust proxy", 1);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 60, //
    max: 100, //max request (100 reequest per windowMs)
  })
);
// extra packages

// routes
app.use("/api/v1/auth/", routerAuth);
app.use("/api/v1/jobs/", tokenVerification, routerJobs);

// MIDWARES
app.use(notFoundMiddleware);
app.use(errorHandler);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await databaseConnection(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
