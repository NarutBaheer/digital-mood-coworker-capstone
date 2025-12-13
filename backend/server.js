const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/wellness_journal";

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error", err));

// Models
const User = require("./models/User");
const Entry = require("./models/Entry");

// API routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/entries", require("./routes/entries"));

// Serve React build files from dist/
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

// For any non-API route, send back React's index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Use the port provided by the environment or 4000 locally
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("Server started on", PORT));
