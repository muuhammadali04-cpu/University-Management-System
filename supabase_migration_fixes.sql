-- ============================================================
-- MIGRATION: run this ONCE in your Supabase project's SQL Editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run)
--
-- This adds a table and a few columns that the app code needs but
-- that were missing from the original supabase_schema.sql, found
-- during a full audit of the app on 2026-08-05.
-- Safe to re-run - every statement is idempotent (IF NOT EXISTS).
-- ============================================================

-- 1. HR Fines module (Fines.vue) was writing to a table that never
--    existed at all, so fines could never be issued/viewed/paid.
CREATE TABLE IF NOT EXISTS hr_fines (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    amount NUMERIC NOT NULL,
    reason TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Unpaid'
);
ALTER TABLE hr_fines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access for hr_fines" ON hr_fines;
CREATE POLICY "Allow public access for hr_fines" ON hr_fines FOR ALL USING (true) WITH CHECK (true);

-- 2. Room "type" (Lecture Hall / Lab / Auditorium) is set in the Add
--    Room form but the column didn't exist, so every room add/edit
--    was being rejected by the database.
ALTER TABLE infrastructure_rooms ADD COLUMN IF NOT EXISTS type TEXT;

-- 3. Timetable slots only stored teacher_id, so the app had to guess
--    which appointment (subject/section/room) a slot belonged to -
--    wrong whenever a teacher has more than one class. Now we store
--    the link directly.
ALTER TABLE timetables ADD COLUMN IF NOT EXISTS appointment_id INTEGER;

-- 4. Grades didn't track which teacher entered them, so the
--    student's report card could never show the teacher's name.
ALTER TABLE academic_grades ADD COLUMN IF NOT EXISTS teacher_id TEXT REFERENCES users(id);

-- 5. "Suggest a new book" writes title/author/reason, but those
--    columns didn't exist on library_requests, so every new-book
--    suggestion was being rejected by the database.
ALTER TABLE library_requests ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE library_requests ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE library_requests ADD COLUMN IF NOT EXISTS reason TEXT;

-- Done. After running this, redeploy the updated app code.
