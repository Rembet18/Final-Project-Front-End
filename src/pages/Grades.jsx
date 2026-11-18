import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Award, Printer, ChevronDown, GraduationCap } from '../components/Icons';
import { getStoredItem } from '../utils/storage';
import { normalizeGrades } from '../utils/calculations';
import initialGrades from '../data/grades.json';

const letterStyle = (grade = '') => {
  if (grade.startsWith('A')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (grade.startsWith('B')) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (grade.startsWith('C')) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-rose-50 text-rose-700 border-rose-200';
};

export const Grades = () => {
  const { currentUser } = useAuth();
  const grades = normalizeGrades(getStoredItem('unisphere_grades_db', initialGrades));

  const [expandedSemester, setExpandedSemester] = useState('sem-5');

  const semesters = grades.semesters || [];
  const summary = grades.summary || {};

  const earned = summary.totalCreditsEarned || 114;
  const required = 144;
  const creditProgress = Math.min(Math.round((earned / required) * 100), 100);

  const summaryCards = [
    {
      label: 'IPK Kumulatif (CGPA)',
      value: Number(summary.cgpa ?? 0).toFixed(2),
      note: `Skala 4.00 • ${summary.academicStanding || 'Distinction'}`,
      valueClass: 'text-white',
      noteClass: 'text-purple-100',
      cardClass: 'bg-gradient-to-br from-purple-600 to-indigo-700 border-transparent shadow-lg shadow-purple-600/25 text-white',
      labelClass: 'text-purple-200'
    },
    {
      label: 'IP Semester Terakhir',
      value: Number(semesters[0]?.gpa ?? 0).toFixed(2),
      note: 'Skala 4.00',
      valueClass: 'text-slate-800',
      noteClass: 'text-purple-600',
      cardClass: 'bg-white border-slate-100 shadow-sm',
      labelClass: 'text-slate-400'
    },
    {
      label: 'SKS Ditempuh',
      value: `${earned} SKS`,
      note: `${earned} dari ${required} SKS (${creditProgress}%)`,
      valueClass: 'text-slate-800',
      noteClass: 'text-slate-500',
      cardClass: 'bg-white border-slate-100 shadow-sm',
      labelClass: 'text-slate-400',
      progress: creditProgress
    },
    {
      label: "Dean's List",
      value: `${summary.totalHonors || 4} Semester`,
      note: 'Penghargaan Prestasi Akademik',
      valueClass: 'text-amber-500',
      noteClass: 'text-amber-600',
      cardClass: 'bg-gradient-to-br from-amber-50 to-white border-amber-100 shadow-sm',
      labelClass: 'text-slate-400'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 print:hidden">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 shrink-0">
            <Award size={24} />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">Nilai & Transkrip</h1>
            <p className="text-sm text-slate-400 mt-1">Rekap nilai kumulatif selama 5 semester kuliah</p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-extrabold shadow-lg shadow-purple-600/30 hover:-translate-y-0.5 transition-all"
        >
          <Printer size={16} />
          <span>Cetak Transkrip Resmi</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        {summaryCards.map((c) => (
          <div
            key={c.label}
            className={`rounded-3xl p-5 border hover:-translate-y-1 transition-transform duration-300 ${c.cardClass}`}
          >
            <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${c.labelClass}`}>{c.label}</span>
            <div className={`text-3xl font-black tracking-tight ${c.valueClass}`}>{c.value}</div>
            <span className={`text-xs font-semibold mt-1 block ${c.noteClass}`}>{c.note}</span>
            {c.progress !== undefined && (
              <div className="mt-3 w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-700"
                  style={{ width: `${c.progress}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Transcript */}
      <div className="space-y-4 print:space-y-6">
        {/* Header khusus cetak */}
        <div className="hidden print:block p-6 border-b-2 border-slate-800 mb-6 text-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <GraduationCap size={32} />
              <div>
                <h1 className="text-lg font-black uppercase">UniSphere University</h1>
                <h2 className="text-xs font-bold text-slate-600">Transkrip Akademik Sarjana Resmi</h2>
              </div>
            </div>
            <div className="text-right text-xs">
              <div>
                <strong>NIM:</strong> {currentUser?.nim || '220010984'}
              </div>
              <div>
                <strong>Mahasiswa:</strong> {currentUser?.name || 'Alex Morgan'}
              </div>
              <div>
                <strong>Jurusan:</strong> {currentUser?.major || 'Computer Science'}
              </div>
            </div>
          </div>
        </div>

        {semesters.map((sem) => {
          const isExpanded = expandedSemester === sem.semesterId;

          return (
            <div
              key={sem.semesterId}
              className={`bg-white rounded-3xl border shadow-sm overflow-hidden transition-all print:border print:shadow-none ${
                isExpanded ? 'border-purple-200 shadow-md' : 'border-slate-100 hover:border-purple-100'
              }`}
            >
              <button
                onClick={() => setExpandedSemester(isExpanded ? null : sem.semesterId)}
                className="w-full p-5 flex items-center justify-between hover:bg-slate-50/70 transition-colors text-left"
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                      isExpanded ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white' : 'bg-purple-50 text-purple-700'
                    }`}
                  >
                    <Award size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800">{sem.name}</h3>
                    <p className="text-xs text-slate-400">{sem.credits} SKS ditempuh</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-extrabold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    IP: {Number(sem.gpa).toFixed(2)} / 4.00
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform duration-300 print:hidden ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              {/* Tabel selalu dirender; disembunyikan di layar bila tertutup, tetap tampil saat cetak */}
              <div
                className={`border-t border-slate-100 overflow-x-auto print:block ${isExpanded ? 'block animate-fade-in' : 'hidden'}`}
              >
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="p-3.5 pl-6">Kode</th>
                      <th className="p-3.5">Mata Kuliah</th>
                      <th className="p-3.5 text-center">SKS</th>
                      <th className="p-3.5 text-center">Skor</th>
                      <th className="p-3.5 text-center">Angka Mutu (4.00)</th>
                      <th className="p-3.5 pr-6 text-center">Huruf</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {sem.courses?.map((c) => (
                      <tr key={c.code} className="hover:bg-purple-50/30 transition-colors">
                        <td className="p-3.5 pl-6 font-bold text-purple-700">{c.code}</td>
                        <td className="p-3.5 font-bold text-slate-800">{c.name}</td>
                        <td className="p-3.5 text-center text-slate-500">{c.credits}</td>
                        <td className="p-3.5 text-center font-medium text-slate-700">{c.score} / 100</td>
                        <td className="p-3.5 text-center font-bold text-slate-800">{Number(c.points).toFixed(1)}</td>
                        <td className="p-3.5 pr-6 text-center">
                          <span className={`font-black px-2.5 py-0.5 rounded-md text-xs border ${letterStyle(c.grade)}`}>
                            {c.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
