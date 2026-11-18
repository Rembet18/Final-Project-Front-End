import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Archive as ArchiveIcon,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Printer,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  User,
  Award,
  BookOpen,
  FileCheck,
  Calendar,
  FileSpreadsheet,
  Download
} from '../components/Icons';
import { getStoredItem } from '../utils/storage';
import { downloadCsv } from '../utils/csv';
import initialArchiveData from '../data/archiveSubmissions.json';
import initialCourses from '../data/courses.json';
import initialAssignments from '../data/assignments.json';

const STORAGE_KEY_ARCHIVE = 'unisphere_archive_submissions_db';

export const Archive = () => {
  const { isLecturer, currentUser } = useAuth();

  const [archiveList] = useState(() =>
    getStoredItem(STORAGE_KEY_ARCHIVE, initialArchiveData)
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [expandedTaskId, setExpandedTaskId] = useState(archiveList[0]?.assignmentId || null);

  // Ekspor seluruh arsip tugas ke CSV (khusus dosen)
  const handleExportArchiveCsv = () => {
    const headers = [
      'No',
      'Kode Matkul',
      'Mata Kuliah',
      'Judul Tugas',
      'Tanggal Selesai',
      'Poin Maksimal',
      'NIM Mahasiswa',
      'Nama Mahasiswa',
      'Waktu Pengumpulan',
      'Ketepatan Waktu',
      'Skor Nilai',
      'Nilai Huruf',
      'Tautan Berkas',
      'Format Berkas',
      'Evaluasi Dosen'
    ];

    const rows = [headers];
    let counter = 1;

    archiveList.forEach((task) => {
      task.submissions?.forEach((sub) => {
        rows.push([
          counter++,
          task.courseCode,
          task.courseName,
          task.title,
          task.completedDate,
          task.maxPoints,
          sub.studentNim,
          sub.studentName,
          sub.submittedAt,
          sub.timeliness,
          sub.score,
          sub.grade,
          sub.fileLink,
          sub.fileType,
          sub.feedback
        ]);
      });
    });

    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCsv(`Rekap_Arsip_Pengumpulan_Dosen_${dateStr}.csv`, rows);
  };

  // Ekspor satu tugas arsip ke CSV
  const handleExportSingleTaskCsv = (task) => {
    const headers = [
      'No',
      'NIM Mahasiswa',
      'Nama Mahasiswa',
      'Waktu Pengumpulan',
      'Ketepatan Waktu',
      'Skor',
      'Poin Maksimal',
      'Nilai Huruf',
      'Tautan Berkas',
      'Format Berkas',
      'Catatan Evaluasi Dosen'
    ];

    const rows = [headers];
    task.submissions?.forEach((sub, idx) => {
      rows.push([
        idx + 1,
        sub.studentNim,
        sub.studentName,
        sub.submittedAt,
        sub.timeliness,
        sub.score,
        task.maxPoints,
        sub.grade,
        sub.fileLink,
        sub.fileType,
        sub.feedback
      ]);
    });

    const cleanTitle = task.title.replace(/[^a-zA-Z0-9]/g, '_');
    downloadCsv(`Arsip_${task.courseCode}_${cleanTitle}.csv`, rows);
  };

  // Toggle buka/tutup accordion list mahasiswa
  const toggleExpand = (id) => {
    setExpandedTaskId((prev) => (prev === id ? null : id));
  };

  // Filter tugas berdasarkan mata kuliah dan pencarian (bisa cari nama mahasiswa juga!)
  const filteredArchive = useMemo(() => {
    return archiveList.filter((item) => {
      const matchesCourse = selectedCourse === 'all' || item.courseCode === selectedCourse;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCourse;

      // Cari berdasarkan judul tugas, kode mata kuliah, nama mata kuliah, atau nama mahasiswa di dalamnya
      const matchesTask =
        item.title.toLowerCase().includes(q) ||
        item.courseCode.toLowerCase().includes(q) ||
        item.courseName.toLowerCase().includes(q);

      const matchesStudent = item.submissions?.some(
        (sub) =>
          sub.studentName.toLowerCase().includes(q) ||
          sub.studentNim.toLowerCase().includes(q)
      );

      return matchesCourse && (matchesTask || matchesStudent);
    });
  }, [archiveList, selectedCourse, searchQuery]);

  // Statistik Ringkasan
  const totalArchivedTasks = archiveList.length;
  const totalSubmissionsCount = archiveList.reduce(
    (acc, item) => acc + (item.submissions?.length || 0),
    0
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-700 to-purple-900 rounded-3xl p-6 lg:p-8 text-white shadow-xl shadow-purple-900/20 relative overflow-hidden print:bg-none print:text-black print:p-0 print:shadow-none">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 rounded-l-full pointer-events-none print:hidden" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-lg print:hidden">
              <ArchiveIcon size={28} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[11px] font-black uppercase tracking-wider text-purple-200 border border-white/20 mb-2 print:hidden">
                <FileCheck size={13} />
                <span>Arsip Tugas Akademik &amp; Rekap Pengumpulan</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-black tracking-tight">
                Arsip Tugas Selesai &amp; Mahasiswa Masuk
              </h1>
              <p className="text-xs text-purple-200 mt-1 max-w-2xl font-medium print:text-slate-600">
                Pusat data terintegrasi seluruh tugas perkuliahan yang telah rampung, dilengkapi rekap nama-nama mahasiswa yang telah mengumpulkan, berkas tugas, nilai, dan evaluasi dosen.
              </p>
            </div>
          </div>

            <div className="flex flex-wrap items-center gap-3 print:hidden">
              {isLecturer && (
                <button
                  onClick={handleExportArchiveCsv}
                  className="px-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black flex items-center gap-2 transition-all shadow-lg hover:-translate-y-0.5 border border-emerald-400"
                  title="Ekspor seluruh rekap arsip mahasiswa ke format file CSV (Excel) - Khusus Dosen"
                >
                  <FileSpreadsheet size={16} />
                  <span>Unduh Rekap CSV (Dosen)</span>
                </button>
              )}

              <button
                onClick={() => window.print()}
                className="px-5 py-3 rounded-2xl bg-white text-purple-800 hover:bg-purple-50 text-xs font-black flex items-center gap-2 transition-all shadow-lg hover:-translate-y-0.5"
              >
                <Printer size={16} />
                <span>Cetak / Ekspor Rekap</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm card-hover-lift">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <ArchiveIcon size={22} />
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                Terverifikasi
              </span>
            </div>
            <div className="text-2xl font-black text-slate-800">{totalArchivedTasks} Tugas Selesai</div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">Disimpan di arsip digital</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm card-hover-lift">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <User size={22} />
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Total Berkas
              </span>
            </div>
            <div className="text-2xl font-black text-slate-800">{totalSubmissionsCount} Mahasiswa</div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">Sudah mengumpulkan tugas</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm card-hover-lift">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Award size={22} />
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Rata-rata Kelas
              </span>
            </div>
            <div className="text-2xl font-black text-slate-800">95.4 / 100</div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">Rerata nilai tugas arsip</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm card-hover-lift">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <CheckCircle size={22} />
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Kepatuhan
              </span>
            </div>
            <div className="text-2xl font-black text-slate-800">100%</div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">Tepat waktu tanpa keterlambatan</div>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari judul tugas, kode mata kuliah, atau nama mahasiswa (misal: 'Alex', 'React')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none w-full md:w-auto font-medium"
            >
              <option value="all">Semua Mata Kuliah</option>
              <option value="CS301">CS301 - Web Architecture &amp; React</option>
              <option value="CS304">CS304 - Database Systems &amp; SQL</option>
              <option value="CS308">CS308 - Computer Networks</option>
              <option value="CS312">CS312 - Software Engineering</option>
              <option value="CS315">CS315 - Artificial Intelligence</option>
              <option value="CS320">CS320 - Cloud Computing</option>
            </select>
          </div>
        </div>

        {/* Daftar Tugas Terarsip & List Nama Mahasiswa */}
        <div className="space-y-4">
          {filteredArchive.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-2">
              <ArchiveIcon size={36} className="mx-auto text-slate-300" />
              <h3 className="text-sm font-extrabold text-slate-700">Tidak ada arsip yang cocok</h3>
              <p className="text-xs text-slate-400">Coba ubah kata kunci pencarian atau filter mata kuliah.</p>
            </div>
          ) : (
            filteredArchive.map((task) => {
              const isExpanded = expandedTaskId === task.assignmentId;
              const subs = task.submissions || [];

              return (
                <div
                  key={task.assignmentId}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-200"
                >
                  {/* Header Kartu Tugas Terarsip */}
                  <div
                    onClick={() => toggleExpand(task.assignmentId)}
                    className="p-6 cursor-pointer hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800">
                          {task.courseCode}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {task.courseName}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          &bull; Selesai: {task.completedDate}
                        </span>
                      </div>

                      <h3 className="text-base font-black text-slate-800">{task.title}</h3>

                      <div className="flex items-center gap-4 text-xs text-slate-500 pt-0.5">
                        <span className="font-bold text-purple-700">Maks. {task.maxPoints} Poin</span>
                        <span>&bull;</span>
                        <span className="font-semibold text-emerald-600 flex items-center gap-1">
                          <CheckCircle size={14} />
                          {subs.length} Mahasiswa Masuk &amp; Dinilai
                        </span>
                      </div>
                    </div>

                    {/* Tombol Expand & Preview Mahasiswa */}
                    <div className="flex items-center gap-4 self-end md:self-auto">
                      {/* Avatars preview */}
                      <div className="flex -space-x-2 overflow-hidden">
                        {subs.slice(0, 4).map((s, idx) => (
                          <img
                            key={idx}
                            src={s.avatar}
                            alt={s.studentName}
                            title={s.studentName}
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                          />
                        ))}
                        {subs.length > 4 && (
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-[10px] font-extrabold text-purple-800 ring-2 ring-white">
                            +{subs.length - 4}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3.5 py-2 rounded-xl transition-colors">
                        <span>{isExpanded ? 'Tutup Daftar' : 'Lihat Mahasiswa'}</span>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </div>

                  {/* Bagian Terbuka: List Nama-Nama Mahasiswa yang Mengumpulkan */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 p-6 bg-slate-50/50 space-y-4 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <User size={14} className="text-purple-600" />
                          <span>Rekap Pengumpulan Mahasiswa ({subs.length} Masuk):</span>
                        </h4>
                        <div className="flex items-center gap-2">
                          {isLecturer && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExportSingleTaskCsv(task);
                              }}
                              className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 flex items-center gap-1 transition-colors"
                              title="Unduh rekap nilai tugas ini ke format file CSV (Excel)"
                            >
                              <Download size={12} />
                              <span>Ekspor CSV (Dosen)</span>
                            </button>
                          )}
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            Status: 100% Terverifikasi
                          </span>
                        </div>
                      </div>

                      {/* Tabel Daftar Mahasiswa */}
                      <div className="overflow-x-auto bg-white rounded-2xl border border-slate-100 shadow-2xs">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                            <tr>
                              <th className="p-3.5 pl-4">No</th>
                              <th className="p-3.5">Nama Mahasiswa</th>
                              <th className="p-3.5">NIM</th>
                              <th className="p-3.5">Waktu Pengumpulan</th>
                              <th className="p-3.5 text-center">Ketepatan</th>
                              <th className="p-3.5 text-center">Nilai</th>
                              <th className="p-3.5">Berkas / Proyek</th>
                              <th className="p-3.5 pr-4">Catatan Evaluasi Dosen</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {subs.map((sub, idx) => (
                              <tr key={sub.studentNim} className="hover:bg-purple-50/30 transition-colors">
                                <td className="p-3.5 pl-4 font-bold text-slate-400 text-center w-8">
                                  {idx + 1}
                                </td>

                                <td className="p-3.5">
                                  <div className="flex items-center gap-2.5">
                                    <img
                                      src={sub.avatar}
                                      alt={sub.studentName}
                                      className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-600/20 shrink-0"
                                    />
                                    <div>
                                      <div className="font-extrabold text-slate-800">{sub.studentName}</div>
                                      <div className="text-[10px] text-slate-400">Teknik Informatika</div>
                                    </div>
                                  </div>
                                </td>

                                <td className="p-3.5 font-mono font-bold text-slate-600">
                                  {sub.studentNim}
                                </td>

                                <td className="p-3.5 text-slate-500 whitespace-nowrap">
                                  <span className="flex items-center gap-1">
                                    <Clock size={12} className="text-purple-500" />
                                    {sub.submittedAt}
                                  </span>
                                </td>

                                <td className="p-3.5 text-center">
                                  <span className="inline-flex items-center gap-1 font-bold text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <CheckCircle size={10} />
                                    {sub.timeliness}
                                  </span>
                                </td>

                                <td className="p-3.5 text-center whitespace-nowrap">
                                  <span className="font-black text-purple-700 text-sm">
                                    {sub.score}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-400">/{task.maxPoints}</span>
                                  <span className="ml-1 text-[10px] font-black px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                    {sub.grade}
                                  </span>
                                </td>

                                <td className="p-3.5 whitespace-nowrap">
                                  <a
                                    href={sub.fileLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg transition-colors"
                                  >
                                    <span>{sub.fileType}</span>
                                    <ExternalLink size={11} />
                                  </a>
                                </td>

                                <td className="p-3.5 pr-4 text-[11px] text-slate-500 max-w-xs leading-relaxed italic">
                                  "{sub.feedback}"
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      );
};

