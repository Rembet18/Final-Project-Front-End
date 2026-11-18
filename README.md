# 🎓 Student Portal — Modern University Academic Dashboard (Frontend Only)

A modern, responsive university academic dashboard web application built for a Front-End Web Development final project.

> **Architecture:** The student portal is a React frontend that uses local JSON data and browser `localStorage`. An optional Node.js/Express server handles Gmail SMTP email notifications. There is no MySQL or PHP backend; Gemini requests are made directly from the browser when an API key is configured.

---

## 🎨 Visual Identity & Design System

- **Primary Brand Color:** University Purple (`#7C3AED` / `#6D28D9`)
- **Secondary Color:** Crisp White (`#FFFFFF`) with Soft Academic Tint (`#F7F7FD`)
- **Status Indicators:**
  - 🟢 Green (`#059669` / `#10B981`) for Good Standing, Submissions & High Attendance.
  - 🟡 Orange/Amber (`#D97706` / `#F59E0B`) for Warnings, Pending Deadlines & Lates.
  - 🔴 Rose/Red (`#E11D48` / `#F43F5E`) for Absences, Overdue Tasks & Errors.
- **Iconography:** Clean vector icon set with consistent stroke widths.
- **Branding:** University Graduation-Cap (`GraduationCap`) identity.

---

## 🚀 Key Features

### 1. 📊 Dashboard
- **Academic Summary Cards:**
  - **My Courses:** 6 Active Subjects
  - **Assignments:** 12 Total (4 Pending • 8 Completed)
  - **Exams:** 3 Scheduled Midterm Examinations
  - **CGPA:** 8.72 (First Class Academic Distinction)
- **Daily Motivational Quote:** Powered by public quotes API with intelligent offline fallback.
- **My Courses Preview:** Progress bars, lecturer names, and credit hours.
- **Upcoming Exams Countdown:** Seat allocations, dates, and venue rooms.
- **Attendance Overview:** Radial circular progress gauge (93.5% Overall Rate).
- **Academic Progress Chart:** Cumulative progression graph comparing GPA and CGPA across terms.
- **Recent Announcements:** Departmental memos and official circulars.

### 2. 📚 My Courses (`/courses`)
- Grid view of all 6 enrolled university courses.
- Course codes, credit hours (SKS), lecturer details, class times, and rooms.
- Realtime keyword search & credit-hour filtering.
- Interactive modal showing full course syllabus and associated course assignments.

### 3. 📝 Assignments (`/assignments`)
- Detailed list of 12 assignments with points, deadlines, and types (Project, Lab, Report, Problem Set).
- Interactive status switcher: **Pending**, **In Progress**, **Submitted**, and **Overdue**.
- Status changes instantly persist in browser `localStorage`.
- Filters by course and by completion status.
- Direct link to the **Arsip Tugas Selesai** repository.

### 4. 📂 Arsip Tugas & Rekap Pengumpulan (`/archive`)
- Database terpadu seluruh tugas perkuliahan yang telah selesai dikerjakan.
- **Daftar Nama Mahasiswa yang Mengumpulkan:** Rekap lengkap per mahasiswa (Nama, NIM, foto, timestamp waktu pengumpulan, status ketepatan waktu, dan skor nilai per tugas).
- Tautan berkas/proyek mahasiswa (GitHub Repository, dokumen PDF, SQL script).
- Catatan evaluasi & feedback penilaian resmi dari dosen.
- Pencarian cerdas (dapat mencari berdasarkan nama mahasiswa atau judul tugas) dan filter mata kuliah.
- Tombol cetak & ekspor rekapitulasi pengumpulan resmi (`window.print()`).

### 5. 📅 Examinations (`/exams`)
- Timetable for upcoming and completed midterm examinations.
- Filter between **Upcoming Exams (3)** and **Past Exams (3)**.
- Official printable Examination Slip modal with student seat numbers, rooms, and instructions.

### 5. ⏱️ Attendance Record (`/attendance`)
- Overall compliance gauge (93.5%).
- Present classes (86), Late arrivals (4), and Absences (2).
- Monthly attendance breakdown chart.
- Subject-by-subject attendance compliance table with exam eligibility indicators.
- Filterable timestamped attendance check-in history.

### 6. 🏆 Grades & Transcripts (`/grades`)
- Cumulative CGPA (8.72) and term-by-term GPA records.
- Semester 1 through 5 historical breakdown with letter grades (A, A-, B+), scores, and grade points.
- Printable academic transcript view (`window.print()`).

### 7. 🤖 Messages — AI Academic Assistant (`/messages`)
- Direct integration with **Google Gemini 1.5 Flash API**.
- Key academic capabilities:
  1. *Ask Academic Questions*
  2. *Summarize Lecture Notes*
  3. *Generate Practice Quizzes*
  4. *Explain Programming Concepts*
  5. *Assignment Architecture Guidance*
- One-click prompt starters.
- Conversation history saved in `localStorage`.
- **Zero-Config Fallback:** If an API key is not provided, the assistant automatically switches to an intelligent local simulation so evaluators can test the UI without an API key!

### 8. 👤 Student Profile (`/profile`)
- Displays complete academic record: NIM, Email, Major, Faculty, Academic Advisor, and Completed Credits.
- Interactive profile editor: update name, phone, residential address, bio, and choose preset avatars.
- Changes persist across reloads in `localStorage`.

### 9. ⚙️ Settings (`/settings`)
- Notification preference toggles (Email digest, Exam alerts, Deadlines).
- Password update with current-password verification; the new password is stored only in this browser.
- Session logout.

### 10. 🔔 Notification System
- Slide-out notification panel accessible from the top navbar.
- Realtime unread count badge.
- Mark single notification or mark all as read (persisted in `localStorage`).


---

## 🛠️ Technology Stack

- **Framework:** React.js 19
- **Build Tool:** Vite 8
- **Language:** JavaScript (ES6+ Modules)
- **Styling:** Tailwind CSS + Custom Design Tokens
- **Routing:** Hash & SPA Navigation
- **Visualizations:** High-Fidelity SVG Charts & Radial Gauges
- **Data Layer:** Local JSON files (`src/data/*.json`)
- **Persistence:** Browser `localStorage` (with safe JSON serialization)
- **External AI:** Google Gemini API (`gemini-1.5-flash`)

---

## 📂 Project Directory Structure

```
student-portal/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Charts.jsx             # Area progression & radial attendance charts
│   │   ├── CourseCard.jsx         # Reusable course card component
│   │   ├── EmptyState.jsx         # Empty state placeholder
│   │   ├── Icons.jsx              # Custom SVG icon set (Lucide-compatible)
│   │   ├── Loading.jsx            # Loading animation
│   │   ├── Navbar.jsx             # Top bar with search & notification bell
│   │   ├── NotificationPanel.jsx  # Notification drawer with read/unread state
│   │   ├── ProtectedRoute.jsx     # Route guard component
│   │   ├── Sidebar.jsx            # Responsive navigation drawer
│   │   └── StatCard.jsx           # Metric dashboard statistic card
│   ├── context/
│   │   └── AuthContext.jsx        # Local account authentication & session state
│   ├── data/
│   │   ├── announcements.json     # University memos & news
│   │   ├── assignments.json       # 12 course assignments & tasks
│   │   ├── attendance.json        # Attendance stats & history
│   │   ├── courses.json           # 6 enrolled subjects
│   │   ├── exams.json             # Midterm & completed exams
│   │   ├── grades.json            # Transcripts across 5 semesters
│   │   ├── notifications.json     # Notification feed
│   │   └── students.json          # Sample student demo records
│   ├── layouts/
│   │   └── DashboardLayout.jsx    # Unified portal frame layout
│   ├── pages/
│   │   ├── Assignments.jsx        # Assignments management
│   │   ├── Attendance.jsx         # Attendance tracking
│   │   ├── Courses.jsx            # Enrolled courses
│   │   ├── Dashboard.jsx          # Primary analytics dashboard
│   │   ├── Exams.jsx              # Exam schedule & slip modal
│   │   ├── Grades.jsx             # Grade sheet & GPA progress
│   │   ├── Login.jsx              # Shared student/lecturer login page
│   │   ├── Messages.jsx           # AI Academic Assistant chat
│   │   ├── NotFound.jsx           # 404 handler
│   │   ├── Profile.jsx            # Student profile & editor
│   │   ├── Register.jsx           # Student account registration
│   │   └── Settings.jsx           # Portal preferences & security
│   ├── services/
│   │   ├── api.js                 # Daily quotes API with offline fallback
│   │   └── gemini.js              # Google Gemini AI service
│   ├── utils/
│   │   ├── calculations.js        # GPA, CGPA & attendance formulas
│   │   └── storage.js             # LocalStorage helper functions
│   ├── App.jsx                    # Root routing & state switcher
│   ├── index.css                  # Custom animations & scrollbars
│   └── main.jsx                   # React root entry point
├── .env                           # Local environment variables
├── .env.example                   # Template environment file
├── .gitignore                     # Git ignore rules
├── index.html                     # HTML5 shell & Tailwind setup
├── package.json                   # Dependencies & npm scripts
├── README.md                      # Comprehensive documentation
└── vite.config.js                 # Vite bundler configuration
```

---

## ⚡ Installation & How to Run

1. Install dependensi frontend dari folder proyek, lalu jalankan:
   ```bash
   npm install
   npm run dev
   ```
   Buka di browser: `http://localhost:5173`

2. *(Opsional, untuk fitur email)* Install dependensi backend sekali:
   ```bash
   cd server
   npm install
   ```
   Salin `server/.env.example` menjadi `server/.env`, lalu isi `EMAIL_USER` dan `EMAIL_PASS` dengan alamat Gmail dan App Password Gmail. Jangan gunakan atau bagikan kata sandi akun Gmail biasa.

3. Kembali ke folder proyek dan jalankan server email:
   ```bash
   cd ..
   npm run server
   ```
   Server email berjalan di: `http://localhost:5000`

---

## 📧 Sistem Pengiriman Email (Gmail SMTP)

Aplikasi dilengkapi modul pengiriman email nyata menggunakan **Nodemailer & Gmail SMTP**:
- **Menu Pengaturan (`/settings`):** Panel untuk mengirim ringkasan akademik mingguan, pengumuman khusus, dan cek status server secara realtime.
- **Menu Ujian (`/exams`):** Tombol **"Kirim ke Email"** langsung pada modal Kartu Tanda Peserta Ujian (UTS).
- **Kredensial Server:** Dikonfigurasi di `server/.env` menggunakan App Password Gmail yang aman.
- **URL backend:** Atur `VITE_EMAIL_API_URL` di `.env` root ke base URL backend yang di-deploy (contoh `https://api.example.com/api`), lalu build ulang frontend. Jika tidak diatur, fitur email menampilkan status belum dikonfigurasi.

---

## 🔑 Login dan Akun (Mahasiswa & Dosen)

- Mahasiswa dapat membuat akun melalui halaman **Buat Akun**, lalu masuk menggunakan NIM, email, atau nama lengkap beserta password.
- Mahasiswa dan dosen menggunakan halaman login yang sama. Akun dosen harus sudah tersedia di data aplikasi; pendaftaran dosen belum disediakan.
- Portal dosen dibatasi untuk akun dengan peran dosen di antarmuka aplikasi.
- **Batasan penting:** akun dan password saat ini disimpan di `localStorage` browser, bukan database/backend terpusat. Ini belum cocok untuk akun kampus sungguhan atau data sensitif; autentikasi dan pemeriksaan peran server diperlukan sebelum dipakai di produksi.
- Pengguna dapat mengganti password di halaman pengaturan dengan memverifikasi password saat ini. Perubahan hanya tersimpan di browser yang sedang dipakai.

### Fitur Dosen (`/lecturer`)
  - **Menerbitkan Tugas Baru:** Form lengkap (Mata kuliah, judul, tipe tugas, tenggat waktu, deskripsi, bobot poin, dan format pengumpulan).
  - **Kirim Email Otomatis:** Opsi broadcast email notifikasi tugas ke mahasiswa via Gmail SMTP.
  - **Pemeriksaan & Penilaian:** Melihat daftar mahasiswa yang sudah mengumpulkan, tautan GitHub/laporan mahasiswa, dan menginput skor (0-100) serta feedback dosen.
  - **Pendaftaran Mata Kuliah:** Menambahkan mahasiswa dari daftar yang tersedia, melihat daftar mahasiswa per mata kuliah, dan mengeluarkan mahasiswa dari kelas. Kapasitas setiap mata kuliah dibatasi maksimal 30 mahasiswa; data pendaftaran disimpan di browser (`localStorage`).
  - **Ekspor Rekap Nilai ke CSV (Excel):** File rekap mencakup NIM, nama, fakultas, status pengumpulan, nilai, dan poin maksimal mahasiswa, serta detail tugas. Format `.csv` memakai UTF-8 BOM agar terbaca baik di Microsoft Excel.
  - **Sinkronisasi Instan:** Tugas yang dibuat dosen langsung muncul di portal mahasiswa secara realtime!

---

## 🤖 Configuring Google Gemini API (Optional)

1. Obtain a free API key from [Google AI Studio](https://aistudio.google.com/).
2. Open the `.env` file in `student-portal/`:
   ```env
   VITE_GEMINI_API_KEY=AIzaSy...your_actual_key_here
   ```
3. Restart the dev server (`npm run dev`).
4. **Security Notice:** In client-side Vite applications, any variable prefixed with `VITE_` is bundled into browser code. Direct frontend API calls are intended strictly for local coursework demonstrations. In production, API keys must be hosted on a secured backend server.

---

## ⚠️ Known Limitations

- Data modifications (e.g. marking an assignment as submitted or updating profile bio) are saved in the client's `localStorage` and will not synchronize across different computers or browsers.
- Clearing your browser's site data/cookies will reset the application to default sample JSON data.
- Email notifications require the optional server and valid Gmail SMTP credentials.
- A `VITE_GEMINI_API_KEY` is exposed in the browser bundle; use it only for local demonstrations, not production deployments.
