import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { CourseCard } from '../components/CourseCard';
import { EmptyState } from '../components/EmptyState';
import { Search, BookOpen, X, Clock, MapPin, User, FileText, CheckCircle } from '../components/Icons';
import { getStoredItem } from '../utils/storage';
import initialAssignments from '../data/assignments.json';
import { getCourses, getTotalCredits } from '../utils/courses';

const CREDIT_FILTERS = [
  { value: 'all', label: 'Semua SKS' },
  { value: '3', label: '3 SKS' },
  { value: '4', label: '4 SKS' }
];

export const Courses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const courses = getCourses();
  const [assignments] = useState(() => getStoredItem('unisphere_assignments_db', initialAssignments));

  const searchQuery = searchParams.get('q') || '';
  const setSearchQuery = (query) => {
    const nextParams = new URLSearchParams(searchParams);
    if (query) nextParams.set('q', query);
    else nextParams.delete('q');
    setSearchParams(nextParams, { replace: true });
  };
  const [creditFilter, setCreditFilter] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState(null);

  const totalCredits = useMemo(() => getTotalCredits(courses), [courses]);

  const filteredCourses = courses.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.lecturer.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.syllabus?.some((topic) => topic.toLowerCase().includes(q));
    const matchesCredit = creditFilter === 'all' || c.credits.toString() === creditFilter;
    return matchesSearch && matchesCredit;
  });

  const courseAssignments = selectedCourse
    ? assignments.filter((a) => a.courseId === selectedCourse.id || a.courseCode === selectedCourse.code)
    : [];

  // Tutup modal dengan tombol Escape + kunci scroll halaman
  useEffect(() => {
    if (!selectedCourse) return undefined;
    const onKey = (e) => e.key === 'Escape' && setSelectedCourse(null);
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [selectedCourse]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 shrink-0">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">Mata Kuliah Saya</h1>
            <p className="text-sm text-slate-400 mt-1">
              Semester Ganjil 2025/2026 •{' '}
              <span className="font-bold text-purple-600">
                {courses.length} matkul · {totalCredits} SKS
              </span>
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200/80 shadow-xs">
            {CREDIT_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setCreditFilter(f.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  creditFilter === f.value
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari matkul atau dosen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-600/10 focus:border-purple-600 transition-all shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      {filteredCourses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Tidak ada mata kuliah yang cocok"
          description="Coba ubah kata kunci pencarian atau filter SKS."
          action={
            <button
              onClick={() => {
                setSearchQuery('');
                setCreditFilter('all');
              }}
              className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors shadow-md shadow-purple-600/25"
            >
              Reset Filter
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, i) => (
            <div
              key={course.id}
              className="animate-slide-up hover:-translate-y-1 transition-transform duration-300"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <CourseCard course={course} onOpenDetails={(c) => setSelectedCourse(c)} />
            </div>
          ))}
        </div>
      )}

      {/* Modal Detail */}
      {selectedCourse && createPortal(
        <div
          className="course-modal-backdrop fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedCourse(null)}
        >
          <div
            className="course-modal bg-white rounded-[2rem] max-w-2xl w-full shadow-2xl relative animate-scale-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="course-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header gradient */}
            <div className="course-modal-header relative bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 text-white p-6 lg:p-8 rounded-t-[2rem] overflow-hidden">
              <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
              <button
                onClick={() => setSelectedCourse(null)}
                className="absolute top-5 right-5 z-10 p-2 text-white/80 hover:text-white rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>

              <div className="relative flex items-center gap-2 mb-3">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 border border-white/25">
                  {selectedCourse.code} • {selectedCourse.credits} SKS
                </span>
                <span className="text-xs font-semibold text-purple-100">{selectedCourse.progress}% selesai</span>
              </div>
              <h2 id="course-modal-title" className="relative text-xl lg:text-2xl font-black pr-10 leading-tight">{selectedCourse.name}</h2>
              <p className="relative text-xs text-purple-100 mt-2 leading-relaxed">{selectedCourse.description}</p>

              <div className="relative mt-4 w-full bg-white/20 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700"
                  style={{ width: `${selectedCourse.progress}%` }}
                />
              </div>
            </div>

            <div className="course-modal-content p-6 lg:p-8">
              {/* Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-7">
                {[
                  { icon: User, label: 'Dosen', value: selectedCourse.lecturer },
                  { icon: Clock, label: 'Jadwal', value: selectedCourse.schedule },
                  { icon: MapPin, label: 'Ruangan', value: selectedCourse.room }
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <div key={m.label} className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0 text-xs">
                        <span className="block text-[10px] uppercase font-bold text-slate-400">{m.label}</span>
                        <span className="font-bold text-slate-700 truncate block">{m.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Syllabus */}
              <div className="mb-7">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <BookOpen size={14} className="text-purple-600" />
                  <span>Silabus Semester (Kurikulum 2026)</span>
                </h3>
                <div className="space-y-2">
                  {selectedCourse.syllabus?.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100/70 text-xs text-slate-700 flex items-start gap-3 hover:bg-purple-50 transition-colors"
                    >
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assignments */}
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <FileText size={14} className="text-purple-600" />
                  <span>Tugas Matkul ({courseAssignments.length})</span>
                </h3>
                {courseAssignments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-4 rounded-2xl bg-slate-50 text-center">
                    Belum ada tugas untuk mata kuliah ini.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {courseAssignments.map((asg) => {
                      const done = asg.status === 'Submitted';
                      return (
                        <div
                          key={asg.id}
                          className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-800 truncate">{asg.title}</h4>
                            <span className="text-[11px] text-slate-400">
                              {asg.points} poin • {asg.type}
                            </span>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                              done ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {done && <CheckCircle size={11} />}
                            {asg.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
