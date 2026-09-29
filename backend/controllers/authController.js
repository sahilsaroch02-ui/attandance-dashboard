const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

async function signup(req, res) {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.execute(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role || "student"],
    );
    res.json({ message: "Account created" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Could not create account" });
  }
}

async function signin(req, res) {
  const { email, password } = req.body;
  const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  const user = users[0];

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Wrong email or password" });
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    process.env.JWT_SECRET,
  );

  res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
}

function profile(req, res) {
  res.json(req.user);
}

module.exports = { signup, signin, profile };
