const express = require("express");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const {
  saveAttendance,
  getMyAttendance,
  getStudents,
} = require("../controllers/attendanceController");

const router = express.Router();
router.get("/me", auth, getMyAttendance);
router.get("/students", auth, role("teacher"), getStudents);
router.post("/", auth, role("teacher"), saveAttendance);

module.exports = router;
