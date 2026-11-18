import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  CalendarDays,
  Clock,
  MapPin,
  Printer,
  X,
  GraduationCap,
  Award,
  AlertCircle,
  Mail,
  CheckCircle,
  RefreshCw
} from '../components/Icons';
import { getStoredItem } from '../utils/storage';
import { sendAcademicEmail } from '../services/email';
import initialExams from '../data/exams.json';

const gradeStyle = (grade = '') => {
  if (grade.startsWith('A')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (grade.startsWith('B')) return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-amber-50 text-amber-700 border-amber-200';
};

export const Exams = () => {
  const { currentUser } = useAuth();
  const exams = getStoredItem('unisphere_exams_db', initialExams);

  const [activeTab, setActiveTab] = useState('upcoming');
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState({ type: '', text: '' });

  const handleSendSlipEmail = async () => {
    setEmailSending(true);
    setEmailStatus({ type: '', text: '' });
    try {
      const recipient = currentUser?.email || 'hibbertsurentu@gmail.com';
      await sendAcademicEmail({
        to: recipient,
        type: 'exam_slip',
        studentData: {
          name: currentUser?.name || 'Alex Morgan',
          nim: currentUser?.nim || '220010984',
          major: currentUser?.major || 'Computer Science'
        }
      });
      setEmailStatus({ type: 'success', text: `Kartu ujian berhasil dikirim ke ${recipient}!` });
      setTimeout(() => setEmailStatus({ type: '', text: '' }), 4000);
    } catch (err) {
      setEmailStatus({
        type: 'error',
        text: err.message.includes('Failed to fetch')
          ? 'Backend server email belum aktif. Jalankan "npm run server" di terminal.'
          : err.message
      });
      setTimeout(() => setEmailStatus({ type: '', text: '' }), 5000);
    } finally {
      setEmailSending(false);
    }
  };

  const upcomingList = exams.upcoming || [];
  const pastList = exams.past || [];

  const averageScore = pastList.length
    ? Math.round(pastList.reduce((sum, e) => sum + Number(e.score || 0), 0) / pastList.length)
    : 0;

  useEffect(() => {
    if (!showSlipModal) return undefined;
    const onKey = (e) => e.key === 'Escape' && setShowSlipModal(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showSlipModal]);

  const tabs = [
    { key: 'upcoming', label: 'Ujian Mendatang', count: upcomingList.length, icon: CalendarDays },
    { key: 'past', label: 'Ujian Selesai', count: pastList.length, icon: Award }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
            <CalendarDays size={24} />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">Ujian & Jadwal</h1>
            <p className="text-sm text-slate-400 mt-1">
              Jadwal UTS Semester Ganjil 2025/2026 dan riwayat ujian sebelumnya
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowSlipModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-extrabold shadow-lg shadow-purple-600/30 hover:-translate-y-0.5 transition-all"
        >
          <Printer size={16} />
          <span>Cetak Kartu Ujian Resmi</span>
        </button>
      </div>

      {/* Segmented Tabs */}
      <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${active
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25'
                  : 'text-slate-500 hover:bg-slate-50'
                }`}
            >
              <Icon size={15} />
              <span>{t.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-white/25' : 'bg-slate-100'}`}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Upcoming */}
      {activeTab === 'upcoming' && (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <AlertCircle size={18} />
            </div>
            <div className="text-xs text-purple-900 leading-relaxed">
              <strong>Tata Tertib Ujian:</strong> Hadir 15 menit sebelum ujian dimulai. Tunjukkan{' '}
              <strong>Kartu Ujian Resmi</strong> dan Kartu Tanda Mahasiswa (KTM) kepada pengawas.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingList.map((exam, i) => (
              <div
                key={exam.id}
                style={{ animationDelay: `${i * 70}ms` }}
                className="animate-slide-up group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-purple-200 transition-all duration-300 flex flex-col overflow-hidden"
              >
                <div className="h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        {exam.courseCode} • {exam.credits} SKS
                      </span>
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        Kursi {exam.seatNumber}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-800 line-clamp-2 mb-4 group-hover:text-purple-700 transition-colors">
                      {exam.courseName}
                    </h3>

                    <div className="space-y-2.5 text-xs text-slate-500 mb-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <CalendarDays size={15} className="text-purple-600 shrink-0" />
                        <span className="font-semibold text-slate-700">{exam.date}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Clock size={15} className="text-purple-600 shrink-0" />
                        <span>{exam.time}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <MapPin size={15} className="text-purple-600 shrink-0" />
                        <span className="font-semibold text-slate-700">
                          {exam.room} ({exam.venue})
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 italic mb-4 leading-relaxed">Catatan: {exam.instructions}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Pengawas</span>
                    <span className="font-bold text-slate-700 truncate ml-3">{exam.invigilator}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past */}
      {activeTab === 'past' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Ujian</span>
              <span className="text-3xl font-black text-slate-800">{pastList.length}</span>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Rata-rata Skor</span>
              <span className="text-3xl font-black text-purple-700">{averageScore}</span>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Skor Tertinggi</span>
              <span className="text-3xl font-black text-emerald-600">
                {pastList.length ? Math.max(...pastList.map((e) => Number(e.score || 0))) : 0}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-sm font-extrabold text-slate-800">Riwayat Ujian (Semester 4)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="p-4">Kode</th>
                    <th className="p-4">Mata Kuliah</th>
                    <th className="p-4">Tanggal</th>
                    <th className="p-4">Ruang</th>
                    <th className="p-4 text-center">Skor</th>
                    <th className="p-4 text-center">Nilai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {pastList.map((exam) => (
                    <tr key={exam.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="p-4 font-bold text-purple-700">{exam.courseCode}</td>
                      <td className="p-4 font-bold text-slate-800">{exam.courseName}</td>
                      <td className="p-4 text-slate-500">{exam.date}</td>
                      <td className="p-4 text-slate-500">{exam.room}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden hidden sm:block">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                              style={{ width: `${Math.min(Number(exam.score) || 0, 100)}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-800">{exam.score}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`font-extrabold px-2.5 py-0.5 rounded-full border ${gradeStyle(exam.grade)}`}>
                          {exam.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Slip Modal */}
      {showSlipModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowSlipModal(false)}
        >
          <div
            className="bg-white rounded-[2rem] max-w-2xl w-full p-6 lg:p-8 shadow-2xl relative animate-scale-in max-h-[95vh] overflow-y-auto print:shadow-none print:m-0 print:p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 print:hidden">
              <span className="text-xs font-bold text-slate-400">Dokumen Ujian Resmi Mahasiswa</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendSlipEmail}
                  disabled={emailSending}
                  className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                  title="Kirim kartu ujian langsung ke email mahasiswa"
                >
                  {emailSending ? <RefreshCw size={14} className="animate-spin" /> : <Mail size={14} />}
                  <span>{emailSending ? 'Mengirim...' : 'Kirim ke Email'}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/25 hover:opacity-90 transition-all"
                >
                  <Printer size={14} />
                  <span>Cetak</span>
                </button>
                <button
                  onClick={() => setShowSlipModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
                  aria-label="Tutup"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {emailStatus.text && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 print:hidden animate-fade-in ${emailStatus.type === 'error'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
              >
                {emailStatus.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
                <span>{emailStatus.text}</span>
              </div>
            )}

            <div className="border-2 border-slate-800 p-6 rounded-2xl bg-white text-slate-800">
              <div className="flex items-center justify-between gap-3 border-b-2 border-slate-800 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center">
                    <GraduationCap size={28} />
                  </div>
                  <div>
                    <h2 className="text-base font-black uppercase tracking-tight">UniSphere University</h2>
                    <h3 className="text-xs font-bold text-slate-600">Kartu Ujian Tengah Semester (UTS)</h3>
                    <span className="text-[10px] text-slate-400">TA 2025/2026 • Semester Ganjil</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">ID Kartu</span>
                  <span className="text-xs font-black font-mono text-purple-700">UTS-2025-CS-9842</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs mb-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                {[
                  ['Nama Mahasiswa', currentUser?.name || 'Alex Morgan'],
                  ['NIM', currentUser?.nim || '220010984'],
                  ['Program Studi', currentUser?.major || 'Computer Science (S1)'],
                  ['Fakultas', currentUser?.faculty || 'Faculty of Engineering']
                ].map(([label, value]) => (
                  <div key={label}>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">{label}</span>
                    <span className="font-bold text-slate-900">{value}</span>
                  </div>
                ))}
              </div>

              <div className="mb-6 overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-2 border-r border-slate-300">Kode</th>
                      <th className="p-2 border-r border-slate-300">Mata Kuliah</th>
                      <th className="p-2 border-r border-slate-300">Tanggal & Waktu</th>
                      <th className="p-2 border-r border-slate-300">Ruang</th>
                      <th className="p-2 text-center">Kursi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {upcomingList.map((exam) => (
                      <tr key={exam.id}>
                        <td className="p-2 font-bold border-r border-slate-300">{exam.courseCode}</td>
                        <td className="p-2 border-r border-slate-300">{exam.courseName}</td>
                        <td className="p-2 border-r border-slate-300">
                          {exam.date} • {exam.time}
                        </td>
                        <td className="p-2 border-r border-slate-300">{exam.room}</td>
                        <td className="p-2 text-center font-bold text-purple-700">{exam.seatNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-2 gap-8 text-center text-xs pt-4 border-t border-slate-300">
                <div>
                  <span className="block text-slate-400 mb-10">Tanda Tangan Peserta</span>
                  <span className="font-bold border-t border-slate-400 pt-1 block">{currentUser?.name || 'Alex Morgan'}</span>
                </div>
                <div>
                  <span className="block text-slate-400 mb-10">Kepala Biro Akademik</span>
                  <span className="font-bold border-t border-slate-400 pt-1 block">Dr. Robert Vance, Ph.D.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
