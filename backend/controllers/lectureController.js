const db = require("../config/db");

async function getLectures(req, res) {
  const [lectures] = await db.execute(
    "SELECT * FROM lectures ORDER BY lecture_number",
  );
  res.json(lectures);
}

module.exports = { getLectures };
