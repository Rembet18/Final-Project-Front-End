import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, GraduationCap, Award, CheckCircle, Clock } from '../components/Icons';
import { getStoredItem } from '../utils/storage';
import { normalizeGrades } from '../utils/calculations';
import initialGrades from '../data/grades.json';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256'
];

const inputClass =
  'w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-purple-600/10 focus:border-purple-600 transition-all';

const InfoRow = ({ icon: Icon, label, value, valueClass = 'text-slate-800', mono = false }) => (
  <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-200/60 last:border-0">
    <span className="flex items-center gap-2 text-slate-400">
      {Icon && <Icon size={14} className="text-purple-500 shrink-0" />}
      {label}
    </span>
    <span className={`font-bold text-right truncate max-w-[60%] ${mono ? 'font-mono' : ''} ${valueClass}`}>{value}</span>
  </div>
);

export const Profile = () => {
  const { currentUser, updateProfile, isLecturer } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || 'Alex Morgan',
    phone: currentUser?.phone || '+62 812-9840-2201',
    address: currentUser?.address || 'Jl. Kampus Merdeka No. 42, Asrama Mahasiswa B-302',
    bio: currentUser?.bio || 'Third-year Computer Science undergraduate passionate about full-stack web architectures and UX.',
    avatar: currentUser?.avatar || AVATAR_PRESETS[0]
  });

  const [savedNotice, setSavedNotice] = useState(false);

  const completed = currentUser?.completedCredits || 114;
  const creditProgress = Math.min(Math.round((completed / 144) * 100), 100);
  const grades = normalizeGrades(getStoredItem('unisphere_grades_db', initialGrades));

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const field = (key) => (e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">
            {isLecturer ? 'Profil Dosen Pengampu' : 'Profil Mahasiswa'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {isLecturer ? 'Data kepegawaian dosen, bidang keahlian, dan informasi kontak' : 'Data akademik resmi, status studi, dan informasi kontak'}
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${isEditing
              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-600/25 hover:-translate-y-0.5'
            }`}
        >
          {isEditing ? 'Batal Edit' : 'Edit Profil'}
        </button>
      </div>

      {savedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle size={16} className="text-emerald-600" />
          <span>Perubahan profil berhasil disimpan di localStorage browser!</span>
        </div>
      )}

      {/* Kartu profil */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* Cover */}
        <div className="relative h-32 lg:h-40 bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 overflow-hidden">
          <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute left-1/3 -bottom-16 h-48 w-48 rounded-full bg-fuchsia-400/25 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
        </div>

        <div className="px-6 lg:px-8 pb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-5 -mt-12 mb-8 pb-8 border-b border-slate-100">
            <div className="relative shrink-0">
              <img
                src={isEditing ? formData.avatar : currentUser?.avatar || AVATAR_PRESETS[0]}
                alt={currentUser?.name || 'Avatar'}
                className="w-28 h-28 rounded-3xl object-cover ring-4 ring-white shadow-xl"
              />
              <span className="absolute bottom-1.5 right-1.5 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white" />
            </div>

            <div className="flex-1 space-y-2 md:pb-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl lg:text-2xl font-black text-slate-800">{currentUser?.name || 'Alex Morgan'}</h2>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  {isLecturer ? `NIP ${currentUser?.nip || '19890820'}` : `NIM ${currentUser?.nim || '220010984'}`}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {isLecturer ? 'Dosen Pengampu Aktif' : 'Mahasiswa Aktif'}
                </span>
              </div>

              <p className="text-sm text-slate-500 font-medium">
                {currentUser?.major || 'Computer Science (Software Engineering)'} •{' '}
                {currentUser?.faculty || 'Faculty of Engineering & Technology'}
              </p>

              <p className="text-sm text-slate-600 leading-relaxed italic max-w-2xl">
                "{currentUser?.bio || 'Undergraduate student at UniSphere University.'}"
              </p>
            </div>
          </div>

          {/* Form edit */}
          {isEditing && (
            <form
              onSubmit={handleSubmit}
              className="mb-8 p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-5 animate-scale-in"
            >
              <h3 className="text-sm font-extrabold text-slate-800">Edit Informasi Pribadi</h3>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-2">Pilih Avatar</label>
                <div className="flex flex-wrap items-center gap-3">
                  {AVATAR_PRESETS.map((presetUrl) => (
                    <button
                      type="button"
                      key={presetUrl}
                      onClick={() => setFormData((prev) => ({ ...prev, avatar: presetUrl }))}
                      className={`p-1 rounded-2xl border-2 transition-all hover:scale-105 ${formData.avatar === presetUrl
                          ? 'border-purple-600 ring-4 ring-purple-600/20'
                          : 'border-transparent hover:border-slate-300'
                        }`}
                    >
                      <img src={presetUrl} alt="Pilihan avatar" className="w-12 h-12 rounded-xl object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">Nama Lengkap</label>
                  <input type="text" value={formData.name} onChange={field('name')} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">No. Telepon</label>
                  <input type="text" value={formData.phone} onChange={field('phone')} className={inputClass} />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">Alamat Tempat Tinggal</label>
                <input type="text" value={formData.address} onChange={field('address')} className={inputClass} />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">Bio Singkat</label>
                <textarea rows={3} value={formData.bio} onChange={field('bio')} className={`${inputClass} resize-none`} />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-purple-600/25"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          )}

          {/* Detail */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <GraduationCap size={16} className="text-purple-600" />
                <span>Rekam Akademik Resmi</span>
              </h3>

              <div className="bg-slate-50 px-5 py-2 rounded-2xl border border-slate-100 text-xs">
                <InfoRow icon={User} label="NIM" value={currentUser?.nim || '220010984'} mono />
                <InfoRow icon={Award} label="Dosen Wali" value={currentUser?.academicAdvisor || 'Dr. Robert Vance, Ph.D.'} />
                <InfoRow
                  icon={Clock}
                  label="Semester Berjalan"
                  value={`Semester ${currentUser?.semester || 6} (Senior)`}
                  valueClass="text-purple-700"
                />
                <InfoRow
                  icon={Award}
                  label="IPK Kumulatif"
                  value={`${Number(grades.summary?.cgpa ?? currentUser?.cgpa ?? 0).toFixed(2)} / 4.00`}
                  valueClass="text-emerald-600"
                />
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-700">SKS Ditempuh</span>
                  <span className="font-extrabold text-purple-700">
                    {completed} / 144 ({creditProgress}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-white overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-700"
                    style={{ width: `${creditProgress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User size={16} className="text-purple-600" />
                <span>Kontak & Tempat Tinggal</span>
              </h3>

              <div className="bg-slate-50 px-5 py-2 rounded-2xl border border-slate-100 text-xs">
                <InfoRow icon={Mail} label="Email Kampus" value={currentUser?.email || 'alex.morgan@unisphere.ac.id'} />
                <InfoRow icon={Phone} label="Telepon" value={currentUser?.phone || '+62 812-9840-2201'} />
                <InfoRow icon={MapPin} label="Alamat" value={currentUser?.address || 'Jl. Kampus Merdeka No. 42'} />
                <InfoRow icon={Clock} label="Tahun Masuk" value={currentUser?.enrollmentYear || 2022} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
