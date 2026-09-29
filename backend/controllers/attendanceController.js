const db = require("../config/db");

async function saveAttendance(req, res) {
  const { student_id, lecture_id, attendance_date, status } = req.body;

  await db.execute(
    `INSERT INTO attendance (student_id, lecture_id, attendance_date, status, marked_by)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE status = ?, marked_by = ?`,
    [
      student_id,
      lecture_id,
      attendance_date,
      status,
      req.user.id,
      status,
      req.user.id,
    ],
  );

  res.json({ message: "Attendance saved" });
}

async function getMyAttendance(req, res) {
  const [rows] = await db.execute(
    `SELECT attendance.*, lectures.lecture_number, lectures.start_time, lectures.end_time
     FROM attendance
     JOIN lectures ON attendance.lecture_id = lectures.id
     WHERE attendance.student_id = ?
     ORDER BY attendance.attendance_date, lectures.lecture_number`,
    [req.user.id],
  );

  res.json(rows);
}

async function getStudents(req, res) {
  const [students] = await db.execute(
    "SELECT id, name, email FROM users WHERE role = 'student' ORDER BY name",
  );
  res.json(students);
}

module.exports = { saveAttendance, getMyAttendance, getStudents };
