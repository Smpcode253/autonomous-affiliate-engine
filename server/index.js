require('dotenv').config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const routes = require("./routes.js");

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, 'frontend')));

// API Routes
app.use("/api", routes);

// Catch-all route - serves index.html for any unknown route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📱 Frontend available at: http://localhost:${PORT}`);
});