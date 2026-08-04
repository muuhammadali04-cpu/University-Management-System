# University Management System (Vercel & Supabase Edition)

This is a modern, role-based ERP designed for Universities, strictly using **Vue 3 (Composition API)**, **Pinia**, and **Tailwind-like Vanilla CSS Aesthetics (Glassmorphism)**.

It has been newly architected to run on a **Vercel Frontend** and a **Supabase PostgreSQL Backend**.

## 🚀 Quick Start Guide

### 1. Supabase Backend Setup
Because this app no longer uses local storage, you MUST set up a backend.
1. Create a free account at [Supabase](https://supabase.com/).
2. Create a new project.
3. Go to the **SQL Editor** in your Supabase dashboard.
4. Copy the entire contents of the `supabase_schema.sql` file located in the root of this repository and run it. This will build all the required tables.
5. In Supabase, go to Project Settings -> API, and copy your `URL` and `anon key`.

### 2. Frontend Configuration
1. Clone this repository.
2. Run `npm install`.
3. Create a `.env` file in the root directory (use `.env.example` as a template).
4. Add your Supabase credentials to the `.env` file:
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
5. Run `npm run dev` to start the local server.

### 3. Vercel Deployment
This project is configured out-of-the-box for Vercel. 
Simply push the code to a GitHub repository, link it to Vercel, and Vercel will automatically detect the Vite build settings. 
**Crucial:** Do not forget to add your Supabase Environment Variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) in the Vercel Dashboard Settings!

## 🔐 Demo Accounts
If you populate your database using the provided mock data, you can log in using:
- **Admin**: `ADM-001`
- **HOD**: `HOD-CS-01`
- **Teacher**: `FAC-001`
- **Student**: `STD-F23-01`
- **Finance**: `FIN-001`
- **HR**: `HR-001`
- **Librarian**: `LIB-001`
*(Default password for all test accounts is `password`)*
