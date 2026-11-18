import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/EmptyState';
import { FileText, Clock, CheckCircle, AlertCircle, Calendar, Filter, Search, Plus, Archive } from '../components/Icons';
import { getStoredItem, setStoredItem } from '../utils/storage';
import { formatDeadline, getDaysRemaining } from '../utils/calculations';
import initialAssignments from '../data/assignments.json';
import { getCourses } from '../utils/courses';

const STORAGE_KEY = 'unisphere_assignments_db';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Submitted'];

const STATUS_STYLE = {
  Submitted: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500', icon: CheckCircle },
  'In Progress': { badge: 'bg-blue-50 text-blue-700 border-blue-200', bar: 'bg-blue-500', icon: Clock },
  Overdue: { badge: 'bg-rose-50 text-rose-700 border-rose-200', bar: 'bg-rose-500', icon: AlertCircle },
  Pending: { badge: 'bg-amber-50 text-amber-700 border-amber-200', bar: 'bg-amber-400', icon: Clock }
};

const getStyle = (status) => STATUS_STYLE[status] || STATUS_STYLE.Pending;

export const Assignments = () => {
  const { isLecturer } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const courses = getCourses();
  const [assignments, setAssignments] = useState(() => getStoredItem(STORAGE_KEY, initialAssignments));

  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const searchQuery = searchParams.get('q') || '';
  const setSearchQuery = (query) => {
    const nextParams = new URLSearchParams(searchParams);
    if (query) nextParams.set('q', query);
    else nextParams.delete('q');
    setSearchParams(nextParams, { replace: true });
  };

  useEffect(() => {
    setStoredItem(STORAGE_KEY, assignments);
  }, [assignments]);

  const handleStatusChange = (assignmentId, newStatus) => {
    setAssignments((prev) => prev.map((a) => (a.id === assignmentId ? { ...a, status: newStatus } : a)));
  };

  const counts = useMemo(() => {
    const pending = assignments.filter((a) => a.status === 'Pending' || a.status === 'In Progress').length;
    const submitted = assignments.filter((a) => a.status === 'Submitted').length;
    return { all: assignments.length, pending, submitted };
  }, [assignments]);

  const progress = counts.all ? Math.round((counts.submitted / counts.all) * 100) : 0;

  const filteredAssignments = assignments.filter((a) => {
    const matchesCourse = selectedCourse === 'all' || a.courseCode === selectedCourse;
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'pending' && (a.status === 'Pending' || a.status === 'In Progress')) ||
      (selectedStatus === 'completed' && a.status === 'Submitted');

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      a.title.toLowerCase().includes(q) ||
      a.courseName.toLowerCase().includes(q) ||
      a.courseCode.toLowerCase().includes(q);

    return matchesCourse && matchesStatus && matchesSearch;
  });

  const tabs = [
    { key: 'all', label: 'Semua', count: counts.all },
    { key: 'pending', label: 'Perlu Dikerjakan', count: counts.pending },
    { key: 'completed', label: 'Terkumpul', count: counts.submitted }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">Tugas & Deadline</h1>
            <p className="text-sm text-slate-400 mt-1">Pantau tugas kuliah, proyek, dan pengumpulan lab</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:min-w-[260px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari tugas atau matkul..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-600/10 focus:border-purple-600 transition-all shadow-xs"
            />
          </div>

          <Link
            to="/archive"
            className="px-3.5 py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 border border-purple-200"
            title="Buka arsip tugas yang sudah selesai beserta daftar mahasiswa"
          >
            <Archive size={14} />
            <span>Arsip Selesai</span>
          </Link>

          {isLecturer && (
            <Link
              to="/lecturer"
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20 shrink-0 transition-all hover:-translate-y-0.5"
              title="Masuk ke portal dosen untuk membuat tugas baru"
            >
              <Plus size={14} />
              <span>Beri Tugas</span>
            </Link>
          )}
        </div>
      </div>

      {/* Progress Summary */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="flex items-center gap-4 sm:w-1/3">
          <div className="relative w-16 h-16 shrink-0">
            <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-slate-100" strokeWidth="3.5" />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                className="stroke-purple-600 transition-all duration-700"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={`${(progress / 100) * 97.4} 97.4`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-slate-800">
              {progress}%
            </span>
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-800">Progres Pengumpulan</h2>
            <p className="text-xs text-slate-400">
              {counts.submitted} dari {counts.all} tugas selesai
            </p>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-slate-50">
            <span className="block text-[10px] font-bold uppercase text-slate-400">Total</span>
            <span className="text-xl font-black text-slate-800">{counts.all}</span>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50">
            <span className="block text-[10px] font-bold uppercase text-amber-600/70">Aktif</span>
            <span className="text-xl font-black text-amber-600">{counts.pending}</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50">
            <span className="block text-[10px] font-bold uppercase text-emerald-600/70">Selesai</span>
            <span className="text-xl font-black text-emerald-600">{counts.submitted}</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setSelectedStatus(t.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${selectedStatus === t.key
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25'
                  : 'text-slate-500 hover:bg-slate-50'
                }`}
            >
              {t.label}
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedStatus === t.key ? 'bg-white/25' : 'bg-slate-100 text-slate-500'
                  }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400 shrink-0" />
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-purple-600/10"
          >
            <option value="all">Semua Mata Kuliah</option>
            {courses.map((c) => (
              <option key={c.id} value={c.code}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards */}
      {filteredAssignments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Tidak ada tugas yang cocok"
          description="Coba ganti tab status atau pilih mata kuliah lain."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAssignments.map((asg, i) => {
            const daysLeft = getDaysRemaining(asg.deadline);
            const submitted = asg.status === 'Submitted';
            const isDueSoon = daysLeft <= 3 && !submitted;
            const style = getStyle(asg.status);
            const StatusIcon = style.icon;

            return (
              <div
                key={asg.id}
                style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                className={`animate-slide-up relative overflow-hidden bg-white rounded-3xl p-5 pl-6 border transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between ${isDueSoon ? 'border-amber-200' : 'border-slate-100 hover:border-purple-200'
                  }`}
              >
                {/* Accent bar kiri */}
                <span className={`absolute left-0 top-0 bottom-0 w-1.5 ${style.bar}`} />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      {asg.courseCode} • {asg.type}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${style.badge}`}
                    >
                      <StatusIcon size={11} />
                      {asg.status}
                    </span>
                  </div>

                  <h3
                    className={`text-sm font-extrabold line-clamp-2 mb-1.5 ${submitted ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-800'
                      }`}
                  >
                    {asg.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">{asg.description}</p>

                  <div className="space-y-2 text-xs mb-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                        <Calendar size={13} className="text-purple-600" />
                        {formatDeadline(asg.deadline)}
                      </span>
                      <span className="font-extrabold text-purple-700">{asg.points} poin</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between gap-2">
                      <span className="truncate">{asg.courseName}</span>
                      {!submitted && (
                        <span
                          className={`font-bold shrink-0 px-2 py-0.5 rounded-full ${isDueSoon ? 'bg-amber-100 text-amber-700' : 'text-slate-500'
                            }`}
                        >
                          {daysLeft === 0 ? 'Hari ini!' : `${daysLeft} hari lagi`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Segmented status control */}
                <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100">
                  {STATUS_OPTIONS.map((statusOption) => (
                    <button
                      key={statusOption}
                      onClick={() => handleStatusChange(asg.id, statusOption)}
                      className={`flex-1 px-2 py-1.5 rounded-xl text-[10px] font-bold transition-all ${asg.status === statusOption
                          ? 'bg-white text-purple-700 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                      {statusOption}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
