# Movie Vault 🎬

A premium, serverless application for tracking your personal movie, series, and game collections with a stunning, high-end dark interface.

## 🚀 Modern Tech Stack
-   **Frontend:** React + Vite (Next-gen bundling)
-   **Styling:** Tailwind CSS 4.0 (Advanced Glassmorphism & HSL gradients)
-   **Backend:** Supabase (PostgreSQL + Auth + Storage)
-   **Automation:** PostgreSQL Triggers and Row Level Security
-   **Icons:** Lucide-React with sleek micro-animations

## ✨ Key Features

### 📊 Interactive Dashboard
-   **Dynamic Stat Cards**: Instantly filter your library by category ("Movies", "Web Series", "Games", etc.) with a single click.
-   **Live Search**: Real-time filtering by title or genre across your entire vault.
-   **Smart Content Form**: Context-aware defaults and automatic title capitalization for a clean database.

### 👤 Premium Identity Section
-   **Vertical Profile Cards**: Focused portrait layout designed to spotlight your personal identity without clutter.
-   **Full Media Support**: Upload and manage custom profile avatars, with professional Lucide icon fallbacks.
-   **Visual Excellence**: Glassmorphism borders, subtle background glows, and interactive accent lines.

### 🎥 Personal Vault (My List)
-   **Rich Status Management**: Track progress with "Wishlist", "Watching", and "Completed" statuses.
-   **Horizontal Media Cards**: High-end layouts featuring poster images, detailed descriptions, and dynamic status badges.
-   **Precision Ratings**: 0.1 decimal precision rating system for the most accurate tracking of your favorites.

---

## 🛠️ Database Setup (Supabase)

To get started, you must run the latest `supabase_schema.sql` script (located in the root folder) within your **Supabase SQL Editor**. This script will:
1.  Initialize the `profiles` and `content` tables.
2.  Enable **Row Level Security** (RLS) policies for secure data access.
3.  Set up **Automated Triggers** for new user registration and timestamp management.
4.  Configure **Storage Policies** for `content-images` and `avatars` buckets.

---

## 🌐 Deploy to Vercel

This project is optimized for deployment as a **Static Site** on Vercel.

### 1. Environment Variables
Add the following variables in your Vercel Dashboard (`Settings > Environment Variables`):

| Variable Name | Value |
| :--- | :--- |
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase Anon Key |

### 2. Build Settings
Vercel should auto-detect these settings, but if not, use:
-   **Framework Preset**: `Vite`
-   **Root Directory**: `frontend`
-   **Build Command**: `npm run build`
-   **Output Directory**: `dist`

---

## 💻 Local Development

1.  **Clone the Repo** and navigate to the frontend:
    ```bash
    cd frontend
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Local Env Setup**:
    Create a `.env` file with your `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
4.  **Launch**:
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:5173`.
