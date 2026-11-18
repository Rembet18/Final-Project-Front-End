import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { AttendanceRadialGauge, AcademicProgressChart } from '../components/Charts';
import {
  BookOpen,
  FileText,
  CalendarDays,
  Award,
  Sparkles,
  Clock,
  ArrowRight,
  MapPin,
  GraduationCap,
  Calendar
} from '../components/Icons';
import { fetchDailyQuote } from '../services/api';
import { getStoredItem } from '../utils/storage';
import { formatDeadline, getDaysRemaining, normalizeGrades } from '../utils/calculations';
import { getCourses, getTotalCredits } from '../utils/courses';

import initialAssignments from '../data/assignments.json';
import initialExams from '../data/exams.json';
import initialAttendance from '../data/attendance.json';
import initialGrades from '../data/grades.json';
import initialAnnouncements from '../data/announcements.json';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 18) return 'Selamat sore';
  return 'Selamat malam';
};

const SectionHeader = ({ title, subtitle, to, linkLabel }) => (
  <div className="flex items-start justify-between gap-3 mb-5">
    <div>
      <h2 className="text-base font-extrabold text-slate-800 tracking-tight">{title}</h2>
      <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
    </div>
    {to && (
      <Link
        to={to}
        className="group shrink-0 inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-full transition-colors"
      >
        <span>{linkLabel}</span>
        <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
      </Link>
    )}
  </div>
);

export const Dashboard = () => {
  const { currentUser } = useAuth();

  const [quoteData, setQuoteData] = useState({
    quote: 'An investment in knowledge pays the best interest.',
    author: 'Benjamin Franklin'
  });

  const courses = getCourses();
  const totalCredits = getTotalCredits(courses);
  const assignments = getStoredItem('unisphere_assignments_db', initialAssignments);
  const exams = getStoredItem('unisphere_exams_db', initialExams);
  const attendance = getStoredItem('unisphere_attendance_db', initialAttendance);
  const grades = normalizeGrades(getStoredItem('unisphere_grades_db', initialGrades));
  const announcements = getStoredItem('unisphere_announcements_db', initialAnnouncements);

  const pendingAssignments = assignments.filter((a) => a.status === 'Pending' || a.status === 'In Progress').length;
  const completedAssignments = assignments.filter((a) => a.status === 'Submitted').length;
  const completionRate = assignments.length ? Math.round((completedAssignments / assignments.length) * 100) : 0;

  // Tugas yang belum selesai, diurutkan dari deadline terdekat
  const nextDeadlines = useMemo(
    () =>
      assignments
        .filter((a) => a.status !== 'Submitted')
        .map((a) => ({ ...a, daysLeft: getDaysRemaining(a.deadline) }))
        .sort((a, b) => a.daysLeft - b.daysLeft)
        .slice(0, 4),
    [assignments]
  );

  useEffect(() => {
    let isMounted = true;
    fetchDailyQuote().then((data) => {
      if (isMounted && data) setQuoteData(data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const firstName = (currentUser?.name || 'Alex Morgan').split(' ')[0];

  return (
    <div className="dashboard-page space-y-8 animate-fade-in">
      {/* Banner Alert Mode Dosen */}
      {currentUser?.role === 'lecturer' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-scale-in">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👨‍🏫</span>
            <div>
              <h4 className="text-xs font-extrabold text-purple-950">Anda sedang login sebagai Dosen ({currentUser.name})</h4>
              <p className="text-[11px] text-purple-700">Akses Portal Dosen untuk membuat tugas baru, memeriksa pengumpulan, dan memberi nilai.</p>
            </div>
          </div>
          <Link
            to="/lecturer"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md shadow-purple-600/20 shrink-0 self-start sm:self-auto"
          >
            Buka Portal Dosen ➔
          </Link>
        </div>
      )}

      {/* Hero Banner */}
      <div className="dashboard-hero relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 p-6 lg:p-9 text-white shadow-xl shadow-purple-600/25">
        {/* Dekorasi */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />

        <div className="dashboard-hero-grid relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-6 items-end">
          <div className="dashboard-hero-copy lg:col-span-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-purple-50 mb-4 border border-white/20">
              <GraduationCap size={14} />
              <span>Semester Ganjil 2025/2026 • Term Aktif</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight mb-3">
              {getGreeting()}, {firstName}! <span className="inline-block animate-bounce">👋</span>
            </h1>
            <p className="text-sm text-purple-100 font-medium leading-relaxed max-w-xl">
              Kamu terdaftar di <strong className="text-white">{courses.length} mata kuliah</strong> dan masih punya{' '}
              <strong className="text-white">{pendingAssignments} tugas</strong> yang perlu diselesaikan. Jadwal UTS dan
              kartu ujian sudah tersedia.
            </p>

            <div className="dashboard-hero-actions flex flex-wrap gap-2.5 mt-5">
              <Link
                to="/assignments"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-purple-700 text-xs font-extrabold shadow-lg shadow-black/10 hover:-translate-y-0.5 hover:shadow-xl transition-all"
              >
                <FileText size={14} />
                Lihat Tugas
              </Link>
              <Link
                to="/exams"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 border border-white/25 text-white text-xs font-bold backdrop-blur-md hover:bg-white/25 transition-all"
              >
                <CalendarDays size={14} />
                Jadwal Ujian
              </Link>
            </div>
          </div>

          {/* Quote */}
          <div className="dashboard-quote lg:col-span-2 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <Sparkles size={18} className="text-purple-100" />
            </div>
            <div className="text-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-200 block mb-1">
                Quote Hari Ini
              </span>
              <span className="italic text-purple-50 leading-relaxed">"{quoteData.quote}"</span>
              <span className="block text-purple-200 font-semibold mt-1.5">— {quoteData.author}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="dashboard-stats grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="animate-slide-up stagger-1 hover:-translate-y-1 transition-transform duration-300">
          <StatCard
            icon={BookOpen}
            title="Mata Kuliah"
            value={`${courses.length} Aktif`}
            subtext={`${totalCredits} SKS terdaftar`}
            badgeText="Term Aktif"
            badgeColor="purple"
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
          />
        </div>
        <div className="animate-slide-up stagger-2 hover:-translate-y-1 transition-transform duration-300">
          <StatCard
            icon={FileText}
            title="Tugas"
            value={`${assignments.length} Total`}
            subtext={`${pendingAssignments} Pending • ${completedAssignments} Selesai`}
            badgeText={pendingAssignments > 0 ? `${pendingAssignments} Perlu Dikerjakan` : 'Semua Selesai'}
            badgeColor={pendingAssignments > 0 ? 'amber' : 'emerald'}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
        </div>
        <div className="animate-slide-up stagger-3 hover:-translate-y-1 transition-transform duration-300">
          <StatCard
            icon={CalendarDays}
            title="Ujian"
            value={`${exams.upcoming?.length || 3} Terjadwal`}
            subtext="Ujian Tengah Semester (UTS)"
            badgeText="Kartu Siap"
            badgeColor="blue"
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
        </div>
        <div className="animate-slide-up stagger-4 hover:-translate-y-1 transition-transform duration-300">
          <StatCard
            icon={Award}
            title="CGPA"
            value={`${Number(grades.summary?.cgpa ?? 0).toFixed(2)} / 4.00`}
            subtext="First Class Distinction"
            badgeText="Top 5%"
            badgeColor="emerald"
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
        </div>
      </div>

      {/* Chart + Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="dashboard-panel lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <SectionHeader
            title="Perkembangan Akademik"
            subtitle="Progres IPK kumulatif selama 5 semester"
            to="/grades"
            linkLabel="Lihat Transkrip"
          />
          <div className="dashboard-chart">
            <AcademicProgressChart progressionData={grades.progression || []} />
          </div>
        </div>

        <div className="dashboard-panel bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <SectionHeader
            title="Tingkat Kehadiran"
            subtitle="Syarat kelayakan ujian"
            to="/attendance"
            linkLabel="Detail"
          />

          <div className="py-2">
            <AttendanceRadialGauge rate={attendance.overallRate || 93.5} />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-4 border-t border-slate-100 text-xs">
            {[
              { label: 'Hadir', value: attendance.summary?.present || 86, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Telat', value: attendance.summary?.late || 4, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Absen', value: attendance.summary?.absent || 2, color: 'text-rose-600', bg: 'bg-rose-50' }
            ].map((s) => (
              <div key={s.label} className={`p-2.5 rounded-2xl ${s.bg}`}>
                <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wide">{s.label}</span>
                <span className={`text-lg font-black ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deadline terdekat + Ujian */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deadline */}
        <div className="dashboard-panel bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <SectionHeader
            title="Deadline Terdekat"
            subtitle={`${completionRate}% tugas sudah dikumpulkan`}
            to="/assignments"
            linkLabel="Semua Tugas"
          />

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-700"
              style={{ width: `${completionRate}%` }}
            />
          </div>

          <div className="space-y-3">
            {nextDeadlines.length === 0 && (
              <p className="text-xs text-slate-400 italic text-center py-6">Hebat! Tidak ada tugas yang menunggu 🎉</p>
            )}
            {nextDeadlines.map((a) => {
              const urgent = a.daysLeft <= 3;
              return (
                <div
                  key={a.id}
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all hover:-translate-y-0.5 ${
                    urgent ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50 border-slate-100 hover:border-purple-200'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      urgent ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    <Calendar size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{a.title}</h4>
                    <span className="text-[11px] text-slate-400">
                      {a.courseCode} • {formatDeadline(a.deadline)}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shrink-0 ${
                      urgent ? 'bg-amber-100 text-amber-700' : 'bg-white text-slate-500 border border-slate-200'
                    }`}
                  >
                    {a.daysLeft === 0 ? 'Hari ini' : `${a.daysLeft} hari`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="dashboard-panel bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <SectionHeader
            title="Jadwal UTS Mendatang"
            subtitle="Alokasi kursi dan ruangan ujian"
            to="/exams"
            linkLabel="Kartu Ujian"
          />

          <div className="space-y-3">
            {exams.upcoming?.slice(0, 3).map((exam) => (
              <div
                key={exam.id}
                className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50/40 border border-purple-100/70 hover:border-purple-200 hover:-translate-y-0.5 transition-all flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                      {exam.courseCode}
                    </span>
                    <span className="text-xs font-bold text-slate-800 truncate">{exam.courseName}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-slate-400" />
                      {exam.date} • {exam.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-slate-400" />
                      {exam.room}
                    </span>
                  </div>
                </div>

                <div className="text-center shrink-0 px-3 py-1.5 rounded-xl bg-white border border-purple-100 shadow-xs">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Kursi</span>
                  <span className="text-sm font-black text-purple-700">{exam.seatNumber}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Courses preview */}
      <div className="dashboard-panel bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <SectionHeader
          title="Progres Mata Kuliah"
          subtitle="Perkembangan term dan SKS"
          to="/courses"
          linkLabel={`Semua ${courses.length} Matkul`}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {courses.slice(0, 3).map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-purple-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <h4 className="text-xs font-bold text-slate-800 truncate">{c.name}</h4>
                <span className="text-xs font-black text-purple-600">{c.progress}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${c.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>
                  {c.code} • {c.credits} SKS
                </span>
                <span className="truncate ml-2">{c.lecturer}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Announcements */}
      <div className="dashboard-panel bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <SectionHeader
          title="Pengumuman & Memo Kampus"
          subtitle="Surat edaran resmi dari Akademik dan Program Studi"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((memo) => (
            <div
              key={memo.id}
              className="group p-5 rounded-2xl border border-slate-100 hover:border-purple-200 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    {memo.category}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">{memo.date}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1.5 leading-snug group-hover:text-purple-700 transition-colors">
                  {memo.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{memo.summary}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium flex items-center justify-between">
                <span>Oleh {memo.author}</span>
                <span className="text-purple-600 font-bold inline-flex items-center gap-1 cursor-pointer">
                  Baca Selengkapnya
                  <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
