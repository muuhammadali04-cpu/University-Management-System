-- University Management System - Extended Seed Data
-- Run this in your Supabase SQL Editor AFTER running the schema file to populate mock accounts.

-- 1. Insert Mock Users (Password for all accounts is 'password')
INSERT INTO users (id, name, role, password, status, joining_date, department, salary, fee_status, balance, section_id, batch)
VALUES 
  ('ADM-001', 'System Admin', 'admin', 'password', 'Active', '2020-01-15', NULL, NULL, NULL, NULL, NULL, NULL),
  ('HOD-CS-01', 'Dr. Alan Turing', 'hod', 'password', 'Active', '2015-08-20', 'Computer Science', 120000, NULL, NULL, NULL, NULL),
  ('HOD-EE-01', 'Dr. Nikola Tesla', 'hod', 'password', 'Active', '2016-02-10', 'Electrical Engineering', 115000, NULL, NULL, NULL, NULL),
  ('FAC-001', 'Prof. Ada Lovelace', 'teacher', 'password', 'Active', '2018-09-01', 'Computer Science', 85000, NULL, NULL, NULL, NULL),
  ('FAC-002', 'Prof. Grace Hopper', 'teacher', 'password', 'Active', '2019-11-15', 'Computer Science', 88000, NULL, NULL, NULL, NULL),
  ('FAC-003', 'Prof. Albert Einstein', 'teacher', 'password', 'Active', '2017-05-20', 'Physics', 95000, NULL, NULL, NULL, NULL),
  ('STD-F23-01', 'Jane Doe', 'student', 'password', 'Active', '2023-08-15', NULL, NULL, 'Paid', 0, 1, 'Fall 2023'),
  ('STD-F23-02', 'John Smith', 'student', 'password', 'Active', '2023-08-16', NULL, NULL, 'Pending', 500, 1, 'Fall 2023'),
  ('STD-F23-03', 'Emma Watson', 'student', 'password', 'Active', '2023-08-17', NULL, NULL, 'Paid', 0, 2, 'Fall 2023'),
  ('STD-F23-04', 'Michael Jordan', 'student', 'password', 'Active', '2023-08-18', NULL, NULL, 'Pending', 1200, 2, 'Fall 2023'),
  ('STD-S24-01', 'Alice Wonderland', 'student', 'password', 'Active', '2024-01-10', NULL, NULL, 'Paid', 0, 1, 'Spring 2024'),
  ('FIN-001', 'Finance Head', 'finance', 'password', 'Active', '2019-03-01', NULL, NULL, NULL, NULL, NULL, NULL),
  ('FIN-002', 'Junior Accountant', 'finance', 'password', 'Active', '2021-06-15', NULL, NULL, NULL, NULL, NULL, NULL),
  ('HR-001', 'HR Manager', 'hr', 'password', 'Active', '2017-11-20', NULL, NULL, NULL, NULL, NULL, NULL),
  ('LIB-001', 'Chief Librarian', 'librarian', 'password', 'Active', '2021-05-15', NULL, NULL, NULL, NULL, NULL, NULL);

-- 2. Insert Infrastructure Data
INSERT INTO infrastructure_rooms (id, name, capacity) VALUES 
  (1, 'Lecture Hall A', 150),
  (2, 'Lecture Hall B', 120),
  (3, 'CS Lab 1', 40),
  (4, 'CS Lab 2', 40),
  (5, 'Physics Lab', 30);

INSERT INTO infrastructure_sections (id, name, semester, program) VALUES 
  (1, 'CS-A', 'Semester 1', 'BS Computer Science'),
  (2, 'CS-B', 'Semester 1', 'BS Computer Science'),
  (3, 'EE-A', 'Semester 3', 'BS Electrical Engineering');

INSERT INTO infrastructure_subjects (id, code, name, credits) VALUES 
  (1, 'CS101', 'Introduction to Programming', 4),
  (2, 'CS201', 'Data Structures', 4),
  (3, 'EE101', 'Circuit Analysis', 3),
  (4, 'MTH101', 'Calculus I', 3),
  (5, 'PHY101', 'Applied Physics', 3);

-- 3. Insert Library Inventory Data
INSERT INTO library_inventory (id, title, author, totalcopies, availablecopies) VALUES 
  ('BOK-001', 'Introduction to Algorithms', 'Thomas H. Cormen', 15, 14),
  ('BOK-002', 'Clean Code', 'Robert C. Martin', 8, 7),
  ('BOK-003', 'Design Patterns', 'Erich Gamma', 5, 4),
  ('BOK-004', 'The Pragmatic Programmer', 'Andrew Hunt', 10, 10),
  ('BOK-005', 'Calculus: Early Transcendentals', 'James Stewart', 20, 20),
  ('BOK-006', 'University Physics', 'Hugh D. Young', 12, 12);

-- 4. Insert Library Requests Data
-- type must be 'borrow' or 'new_book', status must be 'pending'/'approved'/'rejected'
-- (lowercase) to match what the app's filters look for.
INSERT INTO library_requests (user_id, user_name, type, book_id, status) VALUES 
  ('STD-F23-01', 'Jane Doe', 'borrow', 'BOK-001', 'pending'),
  ('STD-F23-02', 'John Smith', 'borrow', 'BOK-002', 'approved'),
  ('STD-S24-01', 'Alice Wonderland', 'borrow', 'BOK-004', 'pending'),
  ('FAC-001', 'Prof. Ada Lovelace', 'borrow', 'BOK-003', 'approved');

-- 5. Insert Finance Vouchers Data
INSERT INTO finance_vouchers (id, student_id, type, amount, status, due_date) VALUES 
  ('VOUCH-2024-001', 'STD-F23-02', 'Tuition Fee', 500.00, 'Unpaid', '2024-09-01'),
  ('VOUCH-2024-002', 'STD-F23-04', 'Tuition Fee', 1200.00, 'Unpaid', '2024-09-01'),
  ('VOUCH-2024-003', 'STD-F23-01', 'Tuition Fee', 500.00, 'Paid', '2024-09-01'),
  ('VOUCH-2024-004', 'STD-S24-01', 'Tuition Fee', 500.00, 'Paid', '2024-09-01');
