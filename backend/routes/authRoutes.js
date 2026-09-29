const express = require("express");
const auth = require("../middleware/authMiddleware");
const { signup, signin, profile } = require("../controllers/authController");

const router = express.Router();
router.post("/signup", signup);
router.post("/signin", signin);
router.get("/profile", auth, profile);

module.exports = router;
