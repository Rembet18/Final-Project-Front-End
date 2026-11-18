import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  FileText,
  Users,
  CheckCircle,
  Clock,
  Plus,
  Trash2,
  Send,
  Mail,
  Award,
  Calendar,
  AlertCircle,
  X,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  Archive,
  Download,
  FileSpreadsheet
} from '../components/Icons';
import { getStoredItem, setStoredItem } from '../utils/storage';
import { sendAcademicEmail } from '../services/email';
import { downloadCsv } from '../utils/csv';
import initialAssignments from '../data/assignments.json';
import { getCourses } from '../utils/courses';

const initialCourses = getCourses();

const STORAGE_KEY_ASSIGNMENTS = 'unisphere_assignments_db';
const STORAGE_KEY_SUBMISSIONS = 'unisphere_submissions_db';
const STORAGE_KEY_ENROLLMENTS = 'unisphere_course_enrollments';
const MAX_STUDENTS_PER_COURSE = 30;

const DEFAULT_SUBMISSIONS = {
  'asg-001': [
    { studentNim: '220010984', studentName: 'Alex Morgan', status: 'Submitted', score: 95, submittedAt: '2026-11-14 14:20', link: 'https://github.com/alex-morgan/unisphere-spa', notes: 'Arsitektur komponen React 19 rapi dan performa cepat.' },
    { studentNim: '220010985', studentName: 'Siti Rahmawati', status: 'Submitted', score: 88, submittedAt: '2026-11-15 09:10', link: 'https://github.com/sitirahma/academic-portal', notes: 'Desain visual bagus, perlu optimasi bundle size.' },
    { studentNim: '220010986', studentName: 'Budi Santoso', status: 'In Progress', score: null, submittedAt: null, link: null, notes: '' },
    { studentNim: '220010987', studentName: 'Farhan Maulana', status: 'Pending', score: null, submittedAt: null, link: null, notes: '' }
  ]
};

export const LecturerPortal = () => {
  const { currentUser, students } = useAuth();

  const [assignments, setAssignments] = useState(() =>
    getStoredItem(STORAGE_KEY_ASSIGNMENTS, initialAssignments)
  );

  const [submissions, setSubmissions] = useState(() =>
    getStoredItem(STORAGE_KEY_SUBMISSIONS, DEFAULT_SUBMISSIONS)
  );

  const [courseEnrollments, setCourseEnrollments] = useState(() => {
    const stored = getStoredItem(STORAGE_KEY_ENROLLMENTS, {});
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return {};

    return Object.fromEntries(
      Object.entries(stored).map(([courseId, studentIds]) => [
        courseId,
        Array.isArray(studentIds) ? [...new Set(studentIds)].slice(0, MAX_STUDENTS_PER_COURSE) : []
      ])
    );
  });

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTaskForGrading, setSelectedTaskForGrading] = useState(null);
  const [selectedCourseForRoster, setSelectedCourseForRoster] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [toast, setToast] = useState({ type: '', message: '' });

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');

  // Form State untuk Tugas Baru
  const [newTitle, setNewTitle] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('CS301');
  const [newType, setNewType] = useState('Project');
  const [newPoints, setNewPoints] = useState(100);
  const [newDeadline, setNewDeadline] = useState('2026-11-28T23:59');
  const [newDesc, setNewDesc] = useState('');
  const [newFormat, setNewFormat] = useState('GitHub Repository URL + Live Vercel/Netlify Link');
  const [sendEmailNotification, setSendEmailNotification] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simpan perubahan ke localStorage
  useEffect(() => {
    setStoredItem(STORAGE_KEY_ASSIGNMENTS, assignments);
  }, [assignments]);

  useEffect(() => {
    setStoredItem(STORAGE_KEY_SUBMISSIONS, submissions);
  }, [submissions]);

  useEffect(() => {
    setStoredItem(STORAGE_KEY_ENROLLMENTS, courseEnrollments);
  }, [courseEnrollments]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 4000);
  };

  // Handler: Tambah Tugas Baru
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Judul tugas tidak boleh kosong!', 'error');
      return;
    }

    setIsSubmitting(true);
    const courseObj = initialCourses.find((c) => c.code === newCourseCode) || initialCourses[0];

    const newTask = {
      id: `asg-${Date.now()}`,
      courseId: courseObj.id,
      courseCode: courseObj.code,
      courseName: courseObj.name,
      title: newTitle.trim(),
      type: newType,
      points: Number(newPoints) || 100,
      deadline: newDeadline ? `${newDeadline}:00` : new Date().toISOString(),
      status: 'Pending',
      description: newDesc.trim() || 'Tugas akademik baru yang diberikan oleh dosen pengampu.',
      submissionFormat: newFormat.trim(),
      lecturerName: currentUser?.name || 'Sir Enrico Djimesha'
    };

    // Tambah ke daftar tugas (muncul di sisi mahasiswa juga!)
    setAssignments((prev) => [newTask, ...prev]);

    // Inisialisasi daftar pengumpulan demo
    setSubmissions((prev) => ({
      ...prev,
      [newTask.id]: [
        { studentNim: '220010984', studentName: 'Alex Morgan', status: 'Pending', score: null, submittedAt: null, link: null, notes: '' },
        { studentNim: '220010985', studentName: 'Siti Rahmawati', status: 'Pending', score: null, submittedAt: null, link: null, notes: '' }
      ]
    }));

    // Jika opsi kirim email diaktifkan, kirim via SMTP
    if (sendEmailNotification) {
      try {
        await sendAcademicEmail({
          to: 'hibbertsurentu@gmail.com',
          type: 'custom',
          subject: `📢 [Tugas Baru Dosen] ${courseObj.code}: ${newTask.title}`,
          message: `Dosen pengampu (${currentUser?.name || 'Sir Enrico Djimesha'}) telah menerbitkan tugas baru untuk mata kuliah ${courseObj.name}.\n\nJudul: ${newTask.title}\nTipe: ${newTask.type}\nTenggat Waktu: ${newTask.deadline}\nPetunjuk: ${newTask.description}\n\nSilakan akses portal UniSphere untuk mulai mengerjakan!`,
          studentData: { name: 'Seluruh Mahasiswa Kelas' }
        });
      } catch (err) {
        console.warn('Gagal broadcast email tugas:', err);
      }
    }

    setIsSubmitting(false);
    setShowCreateModal(false);
    showToast(`Tugas "${newTask.title}" berhasil diterbitkan dan tersedia untuk mahasiswa!`);

    // Reset Form
    setNewTitle('');
    setNewDesc('');
  };

  // Handler: Hapus Tugas
  const handleDeleteAssignment = (taskId, taskTitle) => {
    if (window.confirm(`Yakin ingin menghapus tugas "${taskTitle}"?`)) {
      setAssignments((prev) => prev.filter((a) => a.id !== taskId));
      showToast(`Tugas "${taskTitle}" telah dihapus.`);
    }
  };

  // Handler: Beri Nilai Mahasiswa
  const handleSaveGrade = (taskId, studentNim, score, notes) => {
    setSubmissions((prev) => {
      const taskSubs = prev[taskId] || [];
      const updated = taskSubs.map((s) =>
        s.studentNim === studentNim
          ? { ...s, score: Number(score), notes, status: 'Submitted' }
          : s
      );
      return { ...prev, [taskId]: updated };
    });
    showToast(`Nilai mahasiswa (${studentNim}) berhasil diperbarui!`);
  };

  const handleEnrollStudent = (e) => {
    e.preventDefault();
    const course = selectedCourseForRoster;
    const student = students.find((item) => item.id === selectedStudentId);

    if (!course || !student) {
      showToast('Pilih mahasiswa yang akan didaftarkan.', 'error');
      return;
    }

    if ((courseEnrollments[course.id] || []).length >= MAX_STUDENTS_PER_COURSE) {
      showToast(`Kapasitas ${course.code} sudah penuh (maksimal ${MAX_STUDENTS_PER_COURSE} mahasiswa).`, 'error');
      return;
    }

    setCourseEnrollments((prev) => {
      const enrolledIds = prev[course.id] || [];
      if (enrolledIds.length >= MAX_STUDENTS_PER_COURSE) return prev;
      if (enrolledIds.includes(student.id)) return prev;
      return { ...prev, [course.id]: [...enrolledIds, student.id] };
    });
    setSelectedStudentId('');
    showToast(`${student.name} berhasil ditambahkan ke ${course.code}.`);
  };

  const handleRemoveStudent = (course, student) => {
    if (!window.confirm(`Keluarkan ${student.name} dari ${course.code}?`)) return;

    setCourseEnrollments((prev) => ({
      ...prev,
      [course.id]: (prev[course.id] || []).filter((id) => id !== student.id)
    }));
    showToast(`${student.name} dikeluarkan dari ${course.code}.`);
  };

  const getStudentFaculty = (studentNim) =>
    students.find((student) => student.nim === studentNim)?.faculty || currentUser?.faculty || 'Belum diisi';

  // Ekspor Seluruh Data Nilai & Pengumpulan ke File CSV
  const handleExportAllToCsv = () => {
    const headers = [
      'No',
      'Kode Matkul',
      'Mata Kuliah',
      'Judul Tugas',
      'NIM Mahasiswa',
      'Nama Mahasiswa',
      'Fakultas',
      'Waktu Pengumpulan',
      'Status',
      'Skor Nilai',
      'Poin Maksimal',
      'Tautan Berkas / Repo',
      'Catatan Evaluasi Dosen'
    ];

    const rows = [headers];
    let counter = 1;

    assignments.forEach((task) => {
      const taskSubs = submissions[task.id] || [
        { studentNim: '220010984', studentName: 'Alex Morgan', status: task.status === 'Submitted' ? 'Submitted' : 'Pending', score: task.status === 'Submitted' ? 95 : null, submittedAt: '2026-11-14 14:20', link: 'https://github.com/alex-morgan', notes: 'Pengerjaan baik.' }
      ];

      taskSubs.forEach((sub) => {
        rows.push([
          counter++,
          task.courseCode,
          task.courseName,
          task.title,
          sub.studentNim,
          sub.studentName,
          getStudentFaculty(sub.studentNim),
          sub.submittedAt || '-',
          sub.status === 'Submitted' ? 'Terkumpul' : 'Belum Kumpul',
          sub.score !== null ? sub.score : 'Belum Dinilai',
          task.points,
          sub.link || '-',
          sub.notes || '-'
        ]);
      });
    });

    const dateStr = new Date().toISOString().slice(0, 10);
    const lecturerName = (currentUser?.name || 'Dosen').replace(/[^a-zA-Z0-9]/g, '_');
    downloadCsv(`Rekap_Nilai_${lecturerName}_${dateStr}.csv`, rows);
    showToast('File CSV rekap nilai berhasil diunduh!');
  };

  // Ekspor Nilai Satu Tugas Spesifik ke File CSV
  const handleExportTaskToCsv = (task) => {
    if (!task) return;
    const taskSubs = submissions[task.id] || [
      { studentNim: '220010984', studentName: 'Alex Morgan', status: 'Submitted', score: 95, submittedAt: '2026-11-14 14:20', link: 'https://github.com/alex-morgan/unisphere-spa', notes: 'Arsitektur komponen React 19 rapi dan performa cepat.' }
    ];

    const headers = [
      'No',
      'NIM Mahasiswa',
      'Nama Mahasiswa',
      'Fakultas',
      'Status Pengumpulan',
      'Skor Nilai',
      'Poin Maksimal',
      'Waktu Pengumpulan',
      'Tautan Berkas',
      'Catatan Evaluasi Dosen'
    ];

    const rows = [headers];
    taskSubs.forEach((sub, idx) => {
      rows.push([
        idx + 1,
        sub.studentNim,
        sub.studentName,
        getStudentFaculty(sub.studentNim),
        sub.status === 'Submitted' ? 'Terkumpul' : 'Belum Selesai',
        sub.score !== null ? sub.score : 'Belum Dinilai',
        task.points,
        sub.submittedAt || '-',
        sub.link || '-',
        sub.notes || '-'
      ]);
    });

    const cleanTitle = task.title.replace(/[^a-zA-Z0-9]/g, '_');
    downloadCsv(`Nilai_${task.courseCode}_${cleanTitle}.csv`, rows);
    showToast(`File CSV nilai "${task.title}" berhasil diunduh!`);
  };

  // Filter tugas
  const filteredTasks = assignments.filter((a) => {
    const matchesCourse = selectedCourseFilter === 'all' || a.courseCode === selectedCourseFilter;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      a.title.toLowerCase().includes(q) ||
      a.courseName.toLowerCase().includes(q) ||
      a.courseCode.toLowerCase().includes(q);
    return matchesCourse && matchesQuery;
  });

  const lecturerCourses = initialCourses.filter((course) =>
    currentUser?.courses?.some((assignedCourse) => assignedCourse.code === course.code)
  );
  const totalEnrollments = lecturerCourses.reduce(
    (total, course) => total + (courseEnrollments[course.id] || []).length,
    0
  );
  const enrolledStudents = selectedCourseForRoster
    ? students.filter((student) => (courseEnrollments[selectedCourseForRoster.id] || []).includes(student.id))
    : [];
  const availableStudents = selectedCourseForRoster
    ? students.filter((student) => !(courseEnrollments[selectedCourseForRoster.id] || []).includes(student.id))
    : [];

  // Statistik Dosen
  const totalCourses = lecturerCourses.length;
  const activeTasksCount = assignments.length;

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Toast Alert */}
      {toast.message && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-scale-in text-xs font-bold text-white ${toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
            }`}
        >
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner Dosen */}
      <div className="bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 rounded-3xl p-6 lg:p-8 text-white shadow-xl shadow-purple-900/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 rounded-l-full pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
              alt={currentUser?.name}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/20 shadow-lg"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[11px] font-black uppercase tracking-wider text-purple-200 border border-white/20 mb-2">
                <span>👨‍🏫 Portal Dosen Pengampu</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-black tracking-tight">
                {currentUser?.name || 'Sir Enrico Djimesha'}
              </h1>
              <p className="text-xs text-purple-200 mt-1 font-medium">
                NIP: {currentUser?.nip || 'Dosen123@UniSphere.ac.id'} &bull; {currentUser?.department || 'Informatics & Computer Science'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportAllToCsv}
              className="px-4 py-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm hover:-translate-y-0.5"
              title="Unduh seluruh rekap nilai mahasiswa ke format file CSV (Excel)"
            >
              <FileSpreadsheet size={16} className="text-emerald-300" />
              <span>Ekspor Nilai (CSV)</span>
            </button>

            <Link
              to="/archive"
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Buka arsip pengumpulan mahasiswa"
            >
              <Archive size={15} />
              <span>Arsip Pengumpulan</span>
            </Link>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-3 rounded-2xl bg-white text-purple-800 hover:bg-purple-50 text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-purple-950/20 hover:-translate-y-0.5"
            >
              <Plus size={16} />
              <span>Beri Tugas Baru</span>
            </button>

          </div>
        </div>
        {lecturerCourses.length > 0 && (
          <div className="relative z-10 mt-5 flex flex-wrap items-center gap-2 border-t border-white/15 pt-4">
            <span className="mr-1 text-[11px] font-semibold text-purple-100">Daftar mahasiswa:</span>
            {lecturerCourses.map((course) => (
              <button
                key={course.id}
                type="button"
                onClick={() => {
                  setSelectedCourseForRoster(course);
                  setSelectedStudentId('');
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-white/20"
              >
                <Users size={13} />
                <span>{course.code}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4 Stat Cards Dosen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm card-hover-lift">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <BookOpen size={22} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Semester Aktif
            </span>
          </div>
          <div className="text-2xl font-black text-slate-800">{totalCourses} Mata Kuliah</div>
          <div className="text-xs font-semibold text-slate-400 mt-0.5">CS301 &amp; CS304 diampu</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm card-hover-lift">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users size={22} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Terdaftar
            </span>
          </div>
          <div className="text-2xl font-black text-slate-800">{totalEnrollments} Pendaftaran</div>
          <div className="text-xs font-semibold text-slate-400 mt-0.5">Di mata kuliah yang Anda ampu</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm card-hover-lift">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FileText size={22} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Tugas Aktif
            </span>
          </div>
          <div className="text-2xl font-black text-slate-800">{activeTasksCount} Tugas</div>
          <div className="text-xs font-semibold text-slate-400 mt-0.5">Diberikan ke mahasiswa</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm card-hover-lift">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock size={22} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Perlu Dinilai
            </span>
          </div>
          <div className="text-2xl font-black text-slate-800">4 Pengumpulan</div>
          <div className="text-xs font-semibold text-slate-400 mt-0.5">Menunggu review nilai</div>
        </div>
      </div>

      {/* Mata Kuliah yang Diampu Dosen */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
          <BookOpen size={18} className="text-purple-600" />
          <span>Mata Kuliah yang Anda Ampu Semester Ini</span>
        </h2>

        {lecturerCourses.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada mata kuliah yang ditugaskan ke akun dosen ini.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lecturerCourses.map((course) => (
            <div
              key={course.id}
              className="p-5 rounded-2xl border border-purple-100 bg-purple-50/30 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black px-3 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                    {course.code} &bull; {course.credits} SKS
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {(courseEnrollments[course.id] || []).length}/{MAX_STUDENTS_PER_COURSE} Mahasiswa
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-800 mb-1">{course.name}</h3>
                <p className="text-xs text-slate-500 mb-3">
                  {course.schedule} &bull; {course.room}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-purple-100/60">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCourseForRoster(course);
                    setSelectedStudentId('');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Users size={13} />
                  <span>Daftar Mahasiswa</span>
                </button>
                <button
                  onClick={() => {
                    setNewCourseCode(course.code);
                    setShowCreateModal(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Plus size={13} />
                  <span>Tambah Tugas</span>
                </button>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>

      {/* Tabel Manajemen Tugas yang Diberikan */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
              <FileText size={18} className="text-purple-600" />
              <span>Daftar Tugas yang Diberikan ke Mahasiswa</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Kelola tugas, pantau pengumpulan, dan berikan nilai langsung ke mahasiswa
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-md shadow-purple-600/20"
          >
            <Plus size={14} />
            <span>Buat Tugas Baru</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari judul tugas atau mata kuliah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20"
            />
          </div>

          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none w-full sm:w-auto"
          >
            <option value="all">Semua Mata Kuliah</option>
            <option value="CS301">CS301 - Web Architecture</option>
            <option value="CS304">CS304 - Database Systems</option>
            <option value="CS308">CS308 - Computer Networks</option>
            <option value="CS312">CS312 - Software Engineering</option>
          </select>
        </div>

        {/* List Tugas */}
        <div className="divide-y divide-slate-100">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Tidak ada tugas yang cocok dengan filter pencarian.
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="py-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-purple-50/20 p-3 rounded-2xl transition-colors"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                      {task.courseCode}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {task.type}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Maks. {task.points} Poin
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-slate-800">{task.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1">{task.description}</p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      Deadline: {new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button
                    onClick={() => setSelectedTaskForGrading(task)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:opacity-95 transition-opacity"
                  >
                    <Award size={14} />
                    <span>Periksa &amp; Beri Nilai</span>
                  </button>

                  <button
                    onClick={() => handleDeleteAssignment(task.id, task.title)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Hapus tugas"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal 1: Buat Tugas Baru Mahasiswa */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 lg:p-8 shadow-2xl relative animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">Terbitkan Tugas Baru</h3>
                  <p className="text-xs text-slate-400">Tugas akan langsung muncul di portal mahasiswa</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mata Kuliah</label>
                <select
                  value={newCourseCode}
                  onChange={(e) => setNewCourseCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/20"
                >
                  <option value="CS301">CS301 - Advanced Web Architecture & React (4 SKS)</option>
                  <option value="CS304">CS304 - Database Management Systems & SQL (3 SKS)</option>
                  <option value="CS308">CS308 - Computer Networks & Security (3 SKS)</option>
                  <option value="CS312">CS312 - Software Engineering & Agile (3 SKS)</option>
                  <option value="CS315">CS315 - Artificial Intelligence & ML (4 SKS)</option>
                  <option value="CS320">CS320 - Cloud Computing & DevOps (3 SKS)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Judul Tugas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Implementasi State Management Context API & Vite"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipe Tugas</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none"
                  >
                    <option value="Project">Proyek (Project)</option>
                    <option value="Lab">Praktikum (Lab)</option>
                    <option value="Problem Set">Tugas Mandiri (Problem Set)</option>
                    <option value="Report">Laporan Akademik (Report)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bobot Nilai (Poin)</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={newPoints}
                    onChange={(e) => setNewPoints(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Batas Waktu Pengumpulan (Deadline)</label>
                <input
                  type="datetime-local"
                  required
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Petunjuk &amp; Deskripsi Pengerjaan</label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan detail instruksi, kriteria penilaian, dan instruksi pengerjaan..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Format Pengumpulan</label>
                <input
                  type="text"
                  value={newFormat}
                  onChange={(e) => setNewFormat(e.target.value)}
                  placeholder="Contoh: GitHub Repository URL + Live Vercel Link"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-purple-900">Kirim Pemberitahuan Email Mahasiswa</h5>
                  <p className="text-[10px] text-purple-600">Broadcast email via Gmail SMTP ke seluruh mahasiswa kelas</p>
                </div>
                <input
                  type="checkbox"
                  checked={sendEmailNotification}
                  onChange={(e) => setSendEmailNotification(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20 disabled:opacity-50"
                >
                  {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>{isSubmitting ? 'Menerbitkan...' : 'Terbitkan Tugas'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCourseForRoster && createPortal(
        <div
          className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedCourseForRoster(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 lg:p-8 shadow-2xl relative animate-scale-in max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-none items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider">
                  {selectedCourseForRoster.code} &bull; {selectedCourseForRoster.credits} SKS
                </span>
                <h3 className="text-base font-black text-slate-800">
                  Daftar Mahasiswa ({enrolledStudents.length}/{MAX_STUDENTS_PER_COURSE})
                </h3>
                <p className="text-xs text-slate-500 mt-1">{selectedCourseForRoster.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCourseForRoster(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
                aria-label="Tutup daftar mahasiswa"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEnrollStudent} className="mb-6 flex flex-none flex-col gap-2 sm:flex-row">
              <select
                aria-label="Pilih mahasiswa"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                disabled={availableStudents.length === 0 || enrolledStudents.length >= MAX_STUDENTS_PER_COURSE}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20 disabled:opacity-60"
              >
                <option value="">
                  {enrolledStudents.length >= MAX_STUDENTS_PER_COURSE
                    ? 'Kelas sudah penuh'
                    : availableStudents.length
                      ? 'Pilih mahasiswa...'
                      : 'Tidak ada mahasiswa tersedia'}
                </option>
                {availableStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} — {student.nim}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={!selectedStudentId || enrolledStudents.length >= MAX_STUDENTS_PER_COURSE}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Plus size={14} />
                <span>Tambahkan</span>
              </button>
            </form>

            <div className="flex min-h-0 flex-1 flex-col space-y-3">
              <h4 className="text-xs font-bold text-slate-700">
                Mahasiswa terdaftar ({enrolledStudents.length}/{MAX_STUDENTS_PER_COURSE})
              </h4>
              <p className="text-[11px] text-slate-400">Kapasitas maksimal 30 mahasiswa untuk setiap mata kuliah.</p>
              {enrolledStudents.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
                  Belum ada mahasiswa di mata kuliah ini.
                </p>
              ) : (
                <div className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-100">
                  {enrolledStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between gap-3 p-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{student.name}</p>
                        <p className="text-[11px] text-slate-500">
                          NIM: {student.nim} {student.email ? `• ${student.email}` : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveStudent(selectedCourseForRoster, student)}
                        className="shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50"
                      >
                        Keluarkan
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal 2: Periksa Pengumpulan & Beri Nilai */}
      {selectedTaskForGrading && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedTaskForGrading(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 lg:p-8 shadow-2xl relative animate-scale-in max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider">
                  {selectedTaskForGrading.courseCode} &bull; Maks. {selectedTaskForGrading.points} Poin
                </span>
                <h3 className="text-base font-black text-slate-800">{selectedTaskForGrading.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportTaskToCsv(selectedTaskForGrading)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-emerald-200"
                  title="Unduh rekap nilai tugas ini ke file CSV"
                >
                  <Download size={13} />
                  <span>Unduh Nilai (CSV)</span>
                </button>
                <button
                  onClick={() => setSelectedTaskForGrading(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-700">Daftar Pengumpulan Tugas Mahasiswa:</h4>

              <div className="space-y-3">
                {(submissions[selectedTaskForGrading.id] || [
                  { studentNim: '220010984', studentName: 'Alex Morgan', status: 'Submitted', score: 95, submittedAt: '2026-11-14 14:20', link: 'https://github.com/alex-morgan/unisphere-spa', notes: 'Arsitektur komponen React 19 rapi dan performa cepat.' },
                  { studentNim: '220010985', studentName: 'Siti Rahmawati', status: 'Submitted', score: 88, submittedAt: '2026-11-15 09:10', link: 'https://github.com/sitirahma/academic-portal', notes: 'Desain visual bagus, perlu optimasi bundle size.' },
                  { studentNim: '220010986', studentName: 'Budi Santoso', status: 'In Progress', score: null, submittedAt: null, link: null, notes: '' },
                  { studentNim: '220010987', studentName: 'Farhan Maulana', status: 'Pending', score: null, submittedAt: null, link: null, notes: '' }
                ]).map((sub) => (
                  <div
                    key={sub.studentNim}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-extrabold text-slate-800">{sub.studentName}</h5>
                        <span className="text-[10px] text-slate-400">NIM: {sub.studentNim}</span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${sub.status === 'Submitted'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                      >
                        {sub.status === 'Submitted' ? 'Sudah Mengumpulkan' : 'Belum Selesai'}
                      </span>
                    </div>

                    {sub.link && (
                      <div className="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-100 flex items-center justify-between">
                        <span className="truncate max-w-xs font-mono">{sub.link}</span>
                        <a
                          href={sub.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple-600 font-bold hover:underline shrink-0 ml-2"
                        >
                          Buka Link
                        </a>
                      </div>
                    )}

                    {/* Input Penilaian Dosen */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Skor Nilai (0-100)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          defaultValue={sub.score || ''}
                          placeholder="Nilai"
                          id={`score-${sub.studentNim}`}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-purple-700 focus:outline-none"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Catatan Evaluasi / Feedback</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            defaultValue={sub.notes || ''}
                            placeholder="Catatan dosen untuk mahasiswa..."
                            id={`notes-${sub.studentNim}`}
                            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const scoreVal = document.getElementById(`score-${sub.studentNim}`)?.value;
                              const notesVal = document.getElementById(`notes-${sub.studentNim}`)?.value;
                              handleSaveGrade(selectedTaskForGrading.id, sub.studentNim, scoreVal, notesVal);
                            }}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shrink-0 transition-colors"
                          >
                            Simpan
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedTaskForGrading(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Tutup Jendela Penilaian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
