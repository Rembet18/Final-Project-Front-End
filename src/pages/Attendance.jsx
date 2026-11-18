import { useState } from 'react';
import { AttendanceRadialGauge } from '../components/Charts';
import { Clock, CheckCircle, AlertCircle, ShieldCheck, CalendarDays, Search } from '../components/Icons';
import { getStoredItem } from '../utils/storage';
import initialAttendance from '../data/attendance.json';

const STATUS_STYLE = {
  Present: { chip: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'bg-emerald-50 text-emerald-700', label: 'Hadir' },
  Late: { chip: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'bg-amber-50 text-amber-700', label: 'Telat' },
  Absent: { chip: 'bg-rose-50 text-rose-700 border-rose-200', icon: 'bg-rose-50 text-rose-700', label: 'Absen' }
};

const getStatus = (status) => STATUS_STYLE[status] || STATUS_STYLE.Absent;

const barColor = (rate) => {
  if (rate >= 90) return 'from-emerald-400 to-emerald-600';
  if (rate >= 75) return 'from-purple-500 to-indigo-600';
  return 'from-rose-400 to-rose-600';
};

export const Attendance = () => {
  const attendance = getStoredItem('unisphere_attendance_db', initialAttendance);

  const [historySearch, setHistorySearch] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('all');

  const history = attendance.history || [];
  const compliance = attendance.subjectCompliance || [];
  const monthly = attendance.monthlyBreakdown || [];

  const eligibleCount = compliance.filter((c) => Number(c.rate) >= 75).length;
  const allEligible = compliance.length > 0 && eligibleCount === compliance.length;

  const filteredHistory = history.filter((item) => {
    const q = historySearch.toLowerCase();
    const matchesSearch =
      item.courseName.toLowerCase().includes(q) ||
      item.courseCode.toLowerCase().includes(q) ||
      item.room.toLowerCase().includes(q);
    const matchesStatus =
      historyStatusFilter === 'all' || item.status.toLowerCase() === historyStatusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const summaryItems = [
    { symbol: '✓', title: 'Hadir', desc: 'Datang tepat waktu', value: attendance.summary?.present || 86, text: 'text-emerald-600', bg: 'bg-emerald-100 text-emerald-700' },
    { symbol: '⏱', title: 'Terlambat', desc: 'Dalam 15 menit', value: attendance.summary?.late || 4, text: 'text-amber-600', bg: 'bg-amber-100 text-amber-700' },
    { symbol: '✕', title: 'Absen', desc: '1 izin sakit tercatat', value: attendance.summary?.absent || 2, text: 'text-rose-600', bg: 'bg-rose-100 text-rose-700' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
          <CalendarDays size={24} />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">Kehadiran & Kelayakan Ujian</h1>
          <p className="text-sm text-slate-400 mt-1">
            Rekam presensi biometrik dan RFID (minimal 75% untuk bisa mengikuti ujian)
          </p>
        </div>
      </div>

      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gauge */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center">
          <h2 className="text-sm font-extrabold text-slate-800 mb-1">Kepatuhan Total Semester</h2>
          <span className="text-xs text-slate-400 mb-4">Batas minimum resmi: 75%</span>
          <AttendanceRadialGauge rate={attendance.overallRate || 93.5} size={190} strokeWidth={15} />

          <div
            className={`mt-5 p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
              allEligible
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            {allEligible ? (
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-amber-600 shrink-0" />
            )}
            <span>
              {allEligible
                ? `Layak mengikuti semua ${compliance.length} ujian!`
                : `${eligibleCount} dari ${compliance.length} matkul memenuhi syarat ujian`}
            </span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <h2 className="text-sm font-extrabold text-slate-800 mb-4">Rincian Kehadiran</h2>

          <div className="space-y-3">
            {summaryItems.map((s) => (
              <div
                key={s.title}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-slate-200 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${s.bg}`}>{s.symbol}</div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{s.title}</span>
                    <span className="text-[11px] text-slate-400">{s.desc}</span>
                  </div>
                </div>
                <span className={`text-2xl font-black ${s.text}`}>{s.value}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Total sesi terdaftar</span>
            <span className="font-extrabold text-slate-700">{attendance.summary?.totalSessions || 92} pertemuan</span>
          </div>
        </div>

        {/* Monthly */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800 mb-1">Kepatuhan Bulanan</h2>
            <span className="text-xs text-slate-400 block mb-5">Konsistensi sepanjang semester</span>

            <div className="space-y-4">
              {monthly.map((m) => (
                <div key={m.month} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">{m.month} 2026</span>
                    <span className="font-extrabold text-purple-700">{m.attendanceRate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`bg-gradient-to-r ${barColor(Number(m.attendanceRate))} h-full rounded-full transition-all duration-700`}
                      style={{ width: `${m.attendanceRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-5 border-t border-slate-100 text-[11px] text-slate-400 italic">
            Tersinkron otomatis dengan RFID Smart Gate dan pemindai QR dosen.
          </div>
        </div>
      </div>

      {/* Subject table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-sm font-extrabold text-slate-800">Kepatuhan per Mata Kuliah</h2>
          <p className="text-xs text-slate-400 mt-0.5">Status kelayakan ujian untuk setiap matkul</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Kode</th>
                <th className="p-4">Mata Kuliah</th>
                <th className="p-4 text-center">Hadir / Total</th>
                <th className="p-4">Persentase</th>
                <th className="p-4 text-center">Status Ujian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {compliance.map((sub) => (
                <tr key={sub.courseCode} className="hover:bg-purple-50/30 transition-colors">
                  <td className="p-4 font-bold text-purple-700">{sub.courseCode}</td>
                  <td className="p-4 font-bold text-slate-800">{sub.courseName}</td>
                  <td className="p-4 text-center font-medium">
                    {sub.attended} / {sub.total}
                  </td>
                  <td className="p-4 min-w-[160px]">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${barColor(Number(sub.rate))}`}
                          style={{ width: `${sub.rate}%` }}
                        />
                      </div>
                      <span className="font-extrabold text-slate-800 w-12 text-right">{sub.rate}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1.5 font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle size={12} />
                      <span>{sub.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800">Riwayat Check-In</h2>
            <p className="text-xs text-slate-400">Log presensi lengkap dengan waktu</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100">
              {[
                { v: 'all', l: 'Semua' },
                { v: 'present', l: 'Hadir' },
                { v: 'late', l: 'Telat' },
                { v: 'absent', l: 'Absen' }
              ].map((f) => (
                <button
                  key={f.v}
                  onClick={() => setHistoryStatusFilter(f.v)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    historyStatusFilter === f.v ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {f.l}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari riwayat..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-600/10 focus:border-purple-600"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          {filteredHistory.length === 0 && (
            <p className="text-xs text-slate-400 italic text-center py-8">Tidak ada riwayat yang cocok.</p>
          )}
          {filteredHistory.map((item) => {
            const st = getStatus(item.status);
            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-slate-100 hover:border-purple-200 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${st.icon}`}>
                    <Clock size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-slate-800 truncate">{item.courseName}</span>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded shrink-0">
                        {item.courseCode}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-2">
                      <span>
                        {item.date} • {item.time}
                      </span>
                      <span>•</span>
                      <span>{item.room}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${st.chip}`}>{item.status}</span>
                  <span className="block text-[10px] text-slate-400 mt-1 font-medium">{item.verifiedBy}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
