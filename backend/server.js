require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

/************************
  DATABASE CONNECTION
*************************/
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/************************
  API ROUTES
*************************/
app.use("/api/auth", require("./routes/auth"));

/************************
  FRONTEND SERVE (FIXED FOR RENDER)
*************************/

// IMPORTANT: absolute safe path for Render
const frontendPath = path.join(process.cwd(), "backend", "frontend");

// static files serve
app.use(express.static(frontendPath));

/************************
  ROOT ROUTE
*************************/
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

/************************
  SERVER START
*************************/
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});