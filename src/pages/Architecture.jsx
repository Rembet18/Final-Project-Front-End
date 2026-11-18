import { useState } from 'react';
import {
  Layers,
  Database,
  ShieldCheck,
  Globe,
  Copy,
  CheckCircle,
  FolderTree,
  Cpu,
  Lock,
  Palette,
  Zap,
  Server,
  ExternalLink
} from '../components/Icons';

const CodeBlock = ({ code, onCopy, copied, label }) => (
  <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-lg">
    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/80 border-b border-slate-700">
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
      </div>
      {onCopy && (
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 hover:text-white transition-colors px-2.5 py-1 rounded-lg hover:bg-white/10"
        >
          {copied ? (
            <>
              <CheckCircle size={13} className="text-emerald-400" />
              <span className="text-emerald-400">Tersalin!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>{label}</span>
            </>
          )}
        </button>
      )}
    </div>
    <pre className="text-[11px] font-mono text-emerald-300 p-4 overflow-x-auto whitespace-pre leading-relaxed">{code}</pre>
  </div>
);

export const Architecture = () => {
  const [copiedSection, setCopiedSection] = useState(null);

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const projectStructure = `src/
├── components/       # Reusable UI components
│   ├── Charts.jsx        # AttendanceRadialGauge, AcademicProgressChart
│   ├── CourseCard.jsx     # Course display card with progress
│   ├── EmptyState.jsx     # Empty state placeholder
│   ├── Icons.jsx          # Lucide React icon re-exports
│   ├── Loading.jsx        # Spinner component
│   ├── Navbar.jsx         # Top navigation bar
│   ├── NotificationPanel.jsx  # Slide-out notification drawer
│   ├── ProtectedRoute.jsx     # Auth guard (Navigate + Outlet)
│   ├── Sidebar.jsx        # Left navigation sidebar
│   └── StatCard.jsx       # Metric display card
├── context/
│   └── AuthContext.jsx    # Auth provider (login, register, logout)
├── data/             # Static JSON data layer
│   ├── students.json      # Demo student profile
│   ├── courses.json       # 6 university courses
│   ├── assignments.json   # 12 assignments
│   ├── exams.json         # Upcoming & past exams
│   ├── attendance.json    # Attendance records
│   ├── grades.json        # 5 semester grades
│   ├── announcements.json # University memos
│   └── notifications.json # Notification items
├── layouts/
│   └── DashboardLayout.jsx  # Main layout (Sidebar + Navbar + Outlet)
├── pages/            # Route page components
│   ├── Dashboard.jsx      # Home overview with stats & charts
│   ├── Courses.jsx        # Course catalog with detail modal
│   ├── Assignments.jsx    # Task management with status tracking
│   ├── Exams.jsx          # Exam schedule & printable slips
│   ├── Attendance.jsx     # Attendance analytics & history
│   ├── Grades.jsx         # GPA summary & transcript
│   ├── Messages.jsx       # AI chat (Gemini API integration)
│   ├── Profile.jsx        # Student profile editor
│   ├── Settings.jsx       # Preferences & session management
│   ├── Architecture.jsx   # This page — system documentation
│   ├── Login.jsx          # Authentication page
│   ├── Register.jsx       # Registration form
│   └── NotFound.jsx       # 404 error page
├── services/
│   ├── api.js             # External API calls (quotes)
│   └── gemini.js          # Gemini AI integration + fallback
├── utils/
│   ├── calculations.js    # Academic utility functions
│   └── storage.js         # localStorage wrapper
├── App.jsx           # Root router configuration
├── main.jsx          # React entry point
└── index.css         # Global styles & animations`;

  const authFlowCode = `// AuthContext.jsx — Frontend-only authentication
const user = [...lecturers, ...students].find((account) =>
  matchesIdentifier(account, nimOrNipOrEmailOrName) &&
  account.password === password
);

if (!user) throw new Error('Kredensial tidak sesuai');
setCurrentUser(user);
setStoredItem('unisphere_current_user', user);

// Password changes update the local account record only.
// A production deployment must verify credentials on a backend.`;

  const routingCode = `// App.jsx — HashRouter Route Configuration
<HashRouter>
  <Routes>
    {/* Public Routes — No auth required */}
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    {/* Protected Routes — Requires authentication */}
    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/exams" element={<Exams />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/grades" element={<Grades />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/architecture" element={<Architecture />} />
        <Route element={<ProtectedRoute requiredRole="lecturer" />}>
          <Route path="/lecturer" element={<LecturerPortal />} />
        </Route>
      </Route>
    </Route>
  </Routes>
</HashRouter>`;

  const dataLayerCode = `// Static JSON Data Architecture
// All academic data is served from local JSON files
// No external database required — fully self-contained

import students from './data/students.json';     // Student profiles
import courses from './data/courses.json';        // Course catalog
import assignments from './data/assignments.json';// Task records
import exams from './data/exams.json';            // Exam schedules
import attendance from './data/attendance.json';  // Attendance logs
import grades from './data/grades.json';          // Academic grades
import announcements from './data/announcements.json'; // Memos
import notifications from './data/notifications.json'; // Alerts

// User modifications (status changes, profile edits)
// are persisted to localStorage via utils/storage.js`;

  const securityItems = [
    {
      title: 'Protected Routes',
      desc: 'Pengguna yang belum login dialihkan ke halaman login, dan halaman dosen dibatasi untuk peran dosen di antarmuka. Ini bukan pengganti otorisasi backend.',
      code: '// ProtectedRoute.jsx\nif (!isAuthenticated) return <Navigate to="/login" replace />;\nif (requiredRole && currentUser.role !== requiredRole) return <Navigate to="/" replace />;'
    },
    {
      title: 'Penyimpanan Lokal',
      desc: 'Akun dan sebagian data disimpan di localStorage; data akademik contoh tertentu masih dipakai bersama pada origin browser yang sama. Penyimpanan ini bukan batas keamanan dan tidak tersinkron ke perangkat lain.',
      code: '// Browser localStorage is editable by the user and readable by page scripts.\n// Do not store production passwords or sensitive academic records here.'
    },
    {
      title: 'Environment Variables',
      desc: 'Variabel VITE_ akan ikut masuk ke bundle browser. Gemini saat ini dipanggil langsung dari browser, jadi API key tidak boleh dianggap rahasia untuk deployment publik.',
      code: '// VITE_GEMINI_API_KEY is exposed in the browser bundle.\n// For production, proxy Gemini requests through a secured backend.'
    }
  ];

  const techStack = [
    { icon: Zap, label: 'Build Tool', value: 'Vite 8.3.5', desc: 'Hot Module Replacement, ES modules bundling' },
    { icon: Cpu, label: 'UI Framework', value: 'React 19.3.1', desc: 'Component-based reactive rendering' },
    { icon: Palette, label: 'Styling', value: 'Tailwind CSS (CDN)', desc: 'Utility-first CSS via script injection' }
  ];

  const sections = [
    {
      id: 'architecture',
      number: 1,
      icon: Layers,
      title: 'Arsitektur Aplikasi (Frontend SPA)',
      subtitle:
        'UniSphere dibangun sebagai Single Page Application (SPA) menggunakan React 19 + Vite 8 dengan pendekatan client-side rendering.',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {techStack.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-4 border border-slate-100 hover:border-purple-200 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                      <Icon size={15} />
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{item.label}</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-800">{item.value}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

          <div>
            <h4 className="text-xs font-extrabold text-slate-700 mb-2 flex items-center gap-2">
              <FolderTree size={14} className="text-purple-600" />
              Struktur Direktori Proyek
            </h4>
            <CodeBlock
              code={projectStructure}
              onCopy={() => copyToClipboard(projectStructure, 'structure')}
              copied={copiedSection === 'structure'}
              label="Salin Struktur"
            />
          </div>
        </div>
      )
    },
    {
      id: 'data-layer',
      number: 2,
      icon: Database,
      title: 'Arsitektur Data (Static JSON + localStorage)',
      subtitle:
        'Seluruh data akademik disimpan dalam file JSON statis yang di-import langsung ke komponen React. Perubahan pengguna (profil, status tugas) disimpan ke localStorage browser.',
      code: dataLayerCode,
      codeLabel: 'Salin Konfigurasi Data'
    },
    {
      id: 'auth',
      number: 3,
      icon: Lock,
      title: 'Sistem Autentikasi (Context API + localStorage)',
      subtitle:
        'Login mahasiswa dan dosen memakai form yang sama; akun dan sesi disimpan lokal. Ganti password memeriksa password saat ini, tetapi validasi tetap hanya di frontend.',
      code: authFlowCode,
      codeLabel: 'Salin Kode Auth'
    },
    {
      id: 'routing',
      number: 4,
      icon: Globe,
      title: 'Konfigurasi Routing (HashRouter)',
      subtitle:
        'Menggunakan HashRouter dari react-router-dom v7 untuk navigasi berbasis hash (/#/path). Rute dilindungi oleh komponen ProtectedRoute yang memeriksa status autentikasi.',
      code: routingCode,
      codeLabel: 'Salin Konfigurasi Route'
    },
    {
      id: 'security',
      number: 5,
      icon: ShieldCheck,
      title: 'Keamanan & Perlindungan Data',
      subtitle: 'Keamanan data mahasiswa dijaga dengan beberapa lapisan proteksi di sisi klien:',
      content: (
        <div className="space-y-3">
          {securityItems.map((item) => (
            <div key={item.title} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <h4 className="text-xs font-extrabold text-slate-800 mb-1">{item.title}</h4>
              <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">{item.desc}</p>
              <CodeBlock code={item.code} />
            </div>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 p-6 lg:p-8 text-white shadow-xl shadow-purple-600/25">
        <div className="pointer-events-none absolute -right-12 -top-12 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />

        <div className="relative flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center">
            <Layers size={26} />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-black tracking-tight">Panduan Arsitektur & Integrasi UniSphere</h1>
            <p className="text-xs text-purple-100 mt-1">
              Konfigurasi React SPA, Static JSON Data Layer, dan Context API untuk keperluan penilaian proyek
            </p>
          </div>
        </div>

        <div className="relative flex flex-wrap gap-2">
          {['React 19', 'Vite 8', 'Tailwind CSS', 'HashRouter', 'Context API', 'localStorage', 'Gemini AI'].map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/15 border border-white/25 backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Sections */}
      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <div
            key={section.id}
            className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow space-y-5"
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md shadow-purple-600/25">
                {section.number}
              </div>
              <div>
                <h2 className="text-sm lg:text-base font-extrabold text-slate-800 flex items-center gap-2">
                  <Icon size={16} className="text-purple-600" />
                  {section.title}
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{section.subtitle}</p>
              </div>
            </div>

            {section.code && (
              <CodeBlock
                code={section.code}
                onCopy={() => copyToClipboard(section.code, section.id)}
                copied={copiedSection === section.id}
                label={section.codeLabel}
              />
            )}

            {section.content}
          </div>
        );
      })}

      {/* Footer */}
      <div className="bg-gradient-to-br from-purple-50 to-white rounded-3xl p-6 lg:p-8 border border-purple-100 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Server size={20} />
          </div>
          <div className="space-y-4 flex-1">
            <div>
              <h2 className="text-sm lg:text-base font-extrabold text-slate-800">Mode Deployment & Pengembangan</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                UniSphere adalah aplikasi frontend murni yang dapat di-deploy ke layanan static hosting manapun. Jalankan{' '}
                <code className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-purple-700 font-bold">npm run dev</code>{' '}
                untuk development server, atau{' '}
                <code className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-purple-700 font-bold">npm run build</code>{' '}
                untuk production build.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { href: 'https://react.dev', label: 'React Documentation' },
                { href: 'https://vite.dev', label: 'Vite Documentation' },
                { href: 'https://tailwindcss.com', label: 'Tailwind CSS' }
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-purple-600 hover:text-white bg-white hover:bg-purple-600 border border-purple-200 hover:border-purple-600 px-3.5 py-2 rounded-xl transition-all"
                >
                  <ExternalLink size={12} />
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
