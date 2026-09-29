const express = require("express");
const auth = require("../middleware/authMiddleware");
const { getLectures } = require("../controllers/lectureController");

const router = express.Router();
router.get("/", auth, getLectures);

module.exports = router;
