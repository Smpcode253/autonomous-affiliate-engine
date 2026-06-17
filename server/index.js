
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./routes.js");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api", routes);

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Autonomous Affiliate Engine backend root" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running smoothly on port ${PORT}`);
});