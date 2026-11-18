import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ArrowRight, User, Mail, Lock, BookOpen } from '../components/Icons';

const inputBase =
  'w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-purple-600/10 focus:border-purple-600 focus:bg-white transition-all';

const Field = ({ label, htmlFor, icon: Icon, children }) => (
  <div>
    <label htmlFor={htmlFor} className="text-xs font-bold text-slate-600 block mb-1.5">
      {label}
    </label>
    <div className="relative">
      <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      {children}
    </div>
  </div>
);

export const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    nim: `2200${Math.floor(1000 + Math.random() * 9000)}`,
    email: '',
    major: 'Computer Science',
    faculty: 'Faculty of Engineering & Technology',
    password: ''
  });

  const [errorMsg, setErrorMsg] = useState('');

  const update = (field) => (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Masukkan nama lengkap mahasiswa.');
      return;
    }

    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Pendaftaran gagal.');
    }
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_12%_18%,rgba(196,181,253,0.8),transparent_42%),radial-gradient(ellipse_at_88%_85%,rgba(165,180,252,0.75),transparent_42%),linear-gradient(135deg,#faf5ff,#eef2ff)] flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_1px_1px,rgba(124,58,237,0.16)_1px,transparent_0)] [background-size:26px_26px]"
      >
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-purple-400/35 blur-3xl animate-ambient-float" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-indigo-400/35 blur-3xl animate-ambient-float-reverse" />
        <div className="absolute top-1/4 left-8 h-36 w-36 rounded-full border-2 border-purple-300/45 animate-ambient-rotate" />
        <div className="absolute bottom-1/4 right-10 h-24 w-24 rounded-full border-2 border-indigo-300/45 animate-ambient-rotate" />
      </div>

      <div className="relative z-10 max-w-md w-full bg-white rounded-[2rem] p-8 lg:p-10 border border-slate-100 shadow-2xl shadow-purple-600/10 animate-scale-in">
        <div className="text-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-600/30">
            <GraduationCap size={28} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Daftar Mahasiswa Baru</h1>
          <p className="text-sm text-slate-400 mt-1">Buat akun mahasiswa UniSphere</p>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-fade-in"
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nama Lengkap" htmlFor="reg-name" icon={User}>
            <input
              id="reg-name"
              type="text"
              required
              placeholder="contoh: Jordan Lee"
              value={formData.name}
              onChange={update('name')}
              className={inputBase}
            />
          </Field>

          <Field label="NIM (dibuat otomatis)" htmlFor="reg-nim" icon={GraduationCap}>
            <input
              id="reg-nim"
              type="text"
              required
              value={formData.nim}
              onChange={update('nim')}
              className={`${inputBase} font-mono`}
            />
          </Field>

          <Field label="Email Kampus" htmlFor="reg-email" icon={Mail}>
            <input
              id="reg-email"
              type="email"
              required
              placeholder="jordan.lee@unisphere.ac.id"
              value={formData.email}
              onChange={update('email')}
              className={inputBase}
            />
          </Field>

          <Field label="Program Studi" htmlFor="reg-major" icon={BookOpen}>
            <select id="reg-major" value={formData.major} onChange={update('major')} className={`${inputBase} appearance-none`}>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Systems">Information Systems</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
            </select>
          </Field>

          <Field label="Password" htmlFor="reg-pass" icon={Lock}>
            <input
              id="reg-pass"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={formData.password}
              onChange={update('password')}
              className={inputBase}
            />
          </Field>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-purple-600/25 hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'Membuat Profil...' : 'Selesaikan Pendaftaran'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
          <span>Sudah punya akun? </span>
          <Link to="/login" className="font-extrabold text-purple-600 hover:text-purple-700">
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
};
