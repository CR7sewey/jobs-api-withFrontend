require("dotenv").config();
require("express-async-errors");

// extra security packages
const helmet = require("helmet");
const xss = require("xss-clean");

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

const path = require("path");
app.use(express.static(path.resolve(__dirname, "./client/build")));

app.use(express.json());
app.use(helmet());
app.use(xss());

// extra packages

// routes
app.use("/api/v1/auth/", routerAuth);
app.use("/api/v1/jobs/", tokenVerification, routerJobs);

app.get("*", (req, res) => {
  // index from frontend (react app) - home page
  res.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
});

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
