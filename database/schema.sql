CREATE DATABASE IF NOT EXISTS attendance_db;

USE attendance_db;

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'teacher') NOT NULL DEFAULT 'student'
);

CREATE TABLE IF NOT EXISTS lectures (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lecture_number INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

CREATE TABLE IF NOT EXISTS attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    lecture_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('present', 'absent') NOT NULL,
    marked_by INT NOT NULL,
    UNIQUE KEY one_attendance (
        student_id,
        lecture_id,
        attendance_date
    ),
    FOREIGN KEY (student_id) REFERENCES users (id),
    FOREIGN KEY (lecture_id) REFERENCES lectures (id),
    FOREIGN KEY (marked_by) REFERENCES users (id)
);

INSERT INTO
    lectures (
        lecture_number,
        start_time,
        end_time
    )
SELECT 1, '09:00', '10:00'
WHERE
    NOT EXISTS (
        SELECT 1
        FROM lectures
        WHERE
            lecture_number = 1
    );

INSERT INTO
    lectures (
        lecture_number,
        start_time,
        end_time
    )
SELECT 2, '10:00', '11:00'
WHERE
    NOT EXISTS (
        SELECT 1
        FROM lectures
        WHERE
            lecture_number = 2
    );

INSERT INTO
    lectures (
        lecture_number,
        start_time,
        end_time
    )
SELECT 3, '11:00', '12:00'
WHERE
    NOT EXISTS (
        SELECT 1
        FROM lectures
        WHERE
            lecture_number = 3
    );