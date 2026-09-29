const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const lectureRoutes = require("./routes/lectureRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Attendance API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/attendance", attendanceRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log("Server started on port " + (process.env.PORT || 5000));
});
