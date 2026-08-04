-- University Management System Comprehensive Schema
-- This file creates every table and configures Row Level Security (RLS) policies.

-- Enable UUID extension (useful for generic IDs if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. USERS MODULE
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    password TEXT NOT NULL,
    status TEXT DEFAULT 'Active',
    joining_date DATE,
    department TEXT,
    salary NUMERIC,
    fee_status TEXT,
    balance NUMERIC,
    section_id INTEGER,
    batch TEXT
);

-- ==========================================
-- 2. INFRASTRUCTURE MODULE
-- ==========================================
CREATE TABLE IF NOT EXISTS infrastructure_rooms (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    capacity INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS infrastructure_sections (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    semester TEXT NOT NULL,
    program TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS infrastructure_subjects (
    id SERIAL PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    credits INTEGER NOT NULL
);

-- ==========================================
-- 3. LIBRARY MODULE
-- ==========================================
CREATE TABLE IF NOT EXISTS library_inventory (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT,
    category TEXT,
    totalCopies INTEGER,
    availableCopies INTEGER
);

CREATE TABLE IF NOT EXISTS library_requests (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    user_name TEXT NOT NULL,
    type TEXT NOT NULL,
    book_id TEXT REFERENCES library_inventory(id),
    status TEXT DEFAULT 'Pending'
);

CREATE TABLE IF NOT EXISTS library_issued (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    book_id TEXT REFERENCES library_inventory(id),
    return_date DATE
);

-- ==========================================
-- 4. FINANCE MODULE
-- ==========================================
CREATE TABLE IF NOT EXISTS finance_vouchers (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES users(id),
    type TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'Unpaid',
    due_date DATE
);

CREATE TABLE IF NOT EXISTS finance_payrolls (
    id SERIAL PRIMARY KEY,
    month TEXT NOT NULL,
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'Pending'
);

-- ==========================================
-- 5. ACADEMICS & TIMETABLES
-- ==========================================
CREATE TABLE IF NOT EXISTS academic_grades (
    id SERIAL PRIMARY KEY,
    student_id TEXT REFERENCES users(id),
    subject_id INTEGER REFERENCES infrastructure_subjects(id),
    midterm NUMERIC,
    final NUMERIC,
    assignments NUMERIC
);

CREATE TABLE IF NOT EXISTS academic_attendance (
    id SERIAL PRIMARY KEY,
    student_id TEXT REFERENCES users(id),
    date DATE NOT NULL,
    status TEXT NOT NULL,
    subject_id INTEGER REFERENCES infrastructure_subjects(id)
);

CREATE TABLE IF NOT EXISTS timetables (
    id SERIAL PRIMARY KEY,
    teacher_id TEXT REFERENCES users(id),
    day TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    status TEXT DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    teacher_id TEXT REFERENCES users(id),
    subject_id INTEGER REFERENCES infrastructure_subjects(id),
    section_id INTEGER REFERENCES infrastructure_sections(id),
    room_id INTEGER REFERENCES infrastructure_rooms(id)
);

-- ==========================================
-- 6. HR & COMMUNICATION
-- ==========================================
CREATE TABLE IF NOT EXISTS hr_leaves (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    role TEXT NOT NULL,
    reason TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'Pending'
);

CREATE TABLE IF NOT EXISTS notices (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    role TEXT NOT NULL,
    date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    target_role TEXT,
    target_user_id TEXT,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
-- We enable RLS on every table to secure the database.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE infrastructure_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE infrastructure_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE infrastructure_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_issued ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_payrolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Note: Because your frontend currently handles authentication manually (not using Supabase Auth JWTs), 
-- you must create a public policy to allow the frontend to read/write for now.
-- Once you integrate Supabase Auth properly, you should change `true` to `auth.uid() = id`.

CREATE POLICY "Allow public access for users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for infra_rooms" ON infrastructure_rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for infra_sections" ON infrastructure_sections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for infra_subjects" ON infrastructure_subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for lib_inventory" ON library_inventory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for lib_requests" ON library_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for lib_issued" ON library_issued FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for finance_vouchers" ON finance_vouchers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for finance_payrolls" ON finance_payrolls FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for grades" ON academic_grades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for attendance" ON academic_attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for timetables" ON timetables FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for appointments" ON appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for hr_leaves" ON hr_leaves FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for notices" ON notices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);
