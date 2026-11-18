import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, User, Lock, ArrowRight, CheckCircle } from '../components/Icons';

const HIGHLIGHTS = [
  'Pantau tugas, jadwal ujian, dan kehadiran dalam satu tempat',
  'Transkrip nilai dan IPK yang bisa dicetak kapan saja',
  'Asisten AI akademik untuk belajar lebih cepat'
];

const WELCOME_MESSAGE = 'Selamat datang kembali 👋';
const renderHoverText = (text) => Array.from(text).map((character, index) => (
  <span key={index} className="brand-hover-char">{character}</span>
));

export const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const user = await login(identifier, password);
      if (user.role === 'lecturer') {
        navigate('/lecturer');
      } else {
        navigate('/');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login gagal. Periksa kembali NIM/NIP dan password kamu.');
    }
  };

    return (
      <div className="relative isolate min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_12%_18%,rgba(196,181,253,0.8),transparent_42%),radial-gradient(ellipse_at_88%_85%,rgba(165,180,252,0.75),transparent_42%),linear-gradient(135deg,#faf5ff,#eef2ff)] grid lg:grid-cols-2">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_1px_1px,rgba(124,58,237,0.16)_1px,transparent_0)] [background-size:26px_26px]"
        >
          <div className="absolute -top-36 -right-20 h-[30rem] w-[30rem] rounded-full bg-purple-400/35 blur-3xl animate-ambient-float" />
          <div className="absolute -bottom-40 right-1/4 h-[28rem] w-[28rem] rounded-full bg-indigo-400/35 blur-3xl animate-ambient-float-reverse" />
          <div className="absolute top-1/3 right-8 h-40 w-40 rounded-full border-2 border-purple-300/50 animate-ambient-rotate" />
          <div className="absolute top-[38%] right-16 h-24 w-24 rounded-full border-2 border-indigo-300/50 animate-ambient-rotate" />
        </div>

        {/* Panel kiri: branding */}
        <div className="hidden lg:flex relative z-10 overflow-hidden bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 text-white p-12 flex-col justify-between">
          <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-fuchsia-400/25 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center">
              <GraduationCap size={26} />
            </div>
            <span className="text-xl font-black tracking-tight">UniSphere</span>
          </div>

          <div className="relative z-10 max-w-md">
            <h2 className="text-4xl font-black leading-tight tracking-tight mb-4">
              <span className="block">Semua urusan kuliahmu,</span>
              <span className="block text-purple-200">dalam satu portal.</span>
            </h2>
            <p className="text-sm text-purple-100 leading-relaxed mb-8">
              {renderHoverText('Dashboard akademik modern untuk mahasiswa, dibuat agar rapi, cepat, dan menyenangkan dipakai.')}
            </p>

            <ul className="space-y-3">
              {HIGHLIGHTS.map((h) => (
                <li key={h} className="flex items-start gap-3 text-sm text-purple-50">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <CheckCircle size={13} />
                  </span>
                  <span>{renderHoverText(h)}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative z-10 text-xs text-purple-200">© 2026 UniSphere University</p>
        </div>

        {/* Panel kanan: form */}
        <div className="relative z-10 flex items-center justify-center p-4 sm:p-8">
          <div className="max-w-md w-full bg-white rounded-[2rem] p-8 lg:p-10 border border-slate-100 shadow-2xl shadow-purple-600/10 animate-scale-in">
            <div className="text-center mb-7">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-600/30 lg:hidden">
                <GraduationCap size={30} />
              </div>
              <h1
                aria-label={WELCOME_MESSAGE}
                className="text-2xl font-black text-slate-800 tracking-tight"
              >
                {Array.from(WELCOME_MESSAGE).map((character, index) => (
                  <span
                    key={index}
                    aria-hidden="true"
                    className="welcome-wave-char"
                    style={{ animationDelay: `${index * 45}ms` }}
                  >
                    {character}
                  </span>
                ))}
              </h1>
              <p className="text-sm text-slate-400 mt-1">Masuk ke UniSphere Portal untuk melanjutkan</p>
            </div>

                {errorMsg && (
                  <div
                    role="alert"
                    className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-fade-in"
                  >
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                      <label htmlFor="identifier" className="text-xs font-bold text-slate-600 block mb-1.5">
                        NIM/NIP, email, atau nama lengkap
                      </label>
                      <div className="relative">
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          id="identifier"
                          type="text"
                          required
                          autoComplete="username"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="Masukkan NIM/NIP, email, atau nama"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-purple-600/10 focus:border-purple-600 focus:bg-white transition-all"
                        />
                      </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="text-xs font-bold text-slate-600 block mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan password"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-purple-600/10 focus:border-purple-600 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 mt-2"
                  >
                    <span>{loading ? 'Memverifikasi...' : 'Masuk ke Portal'}</span>
                    <ArrowRight size={14} />
                  </button>
                </form>

                <div className="mt-7 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
                  <span>Belum punya profil mahasiswa? </span>
                  <Link to="/register" className="font-extrabold text-purple-600 hover:text-purple-700">
                    Buat Akun
                  </Link>
                </div>
              </div>
            </div>
          </div>
          );
};
