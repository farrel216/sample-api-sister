const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
require("dotenv").config();

const indexRouter = require("./routes/index");
const apiRouter = require("./routes/api");

app.use("/", indexRouter);
app.use("/api", apiRouter);

const server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);
