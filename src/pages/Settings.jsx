import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, ShieldCheck, LogOut, CheckCircle, AlertCircle, Mail, Send, RefreshCw, Sparkles } from '../components/Icons';
import { getStoredItem, setStoredItem } from '../utils/storage';
import { normalizeGrades } from '../utils/calculations';
import initialGrades from '../data/grades.json';
import { checkEmailServerStatus, sendAcademicEmail } from '../services/email';

const SETTINGS_KEY = 'unisphere_settings';

const DEFAULT_SETTINGS = {
  examAlerts: true,
  deadlineAlerts: true,
  emailDigest: true
};

const NOTIFICATION_ITEMS = [
  {
    key: 'examAlerts',
    title: 'Notifikasi Jadwal Ujian',
    desc: 'Terima info kursi dan perubahan ruangan 48 jam sebelum ujian',
    emoji: '📝'
  },
  {
    key: 'deadlineAlerts',
    title: 'Peringatan Deadline Tugas',
    desc: 'Ingatkan saya saat tugas tersisa 3 hari atau kurang',
    emoji: '⏰'
  },
  {
    key: 'emailDigest',
    title: 'Ringkasan Akademik Mingguan',
    desc: 'Rangkuman kelas, persentase kehadiran, dan metrik IPK lewat email',
    emoji: '📬'
  }
];

const Toggle = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={onChange}
    className={`w-12 h-7 rounded-full transition-colors relative p-0.5 shrink-0 focus:outline-none focus:ring-4 focus:ring-purple-600/20 ${checked ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-slate-200'
      }`}
  >
    <span
      className={`block w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'
        }`}
    />
  </button>
);

const passwordInput =
  'w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-purple-600/10 focus:border-purple-600 focus:bg-white transition-all';

export const Settings = () => {
  const { currentUser, logout, updatePassword } = useAuth();

  const settingsKey = `${SETTINGS_KEY}_${currentUser?.id || 'anonymous'}`;
  const [prefs, setPrefs] = useState(() => ({
    ...DEFAULT_SETTINGS,
    ...getStoredItem(settingsKey, DEFAULT_SETTINGS)
  }));

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passwordNotice, setPasswordNotice] = useState({ type: '', text: '' });

  // Email Dispatcher State
  const [serverStatus, setServerStatus] = useState({ checked: false, online: false, message: '' });
  const [emailTo, setEmailTo] = useState(currentUser?.email || 'hibbertsurentu@gmail.com');
  const [emailType, setEmailType] = useState('digest');
  const [customMessage, setCustomMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailNotice, setEmailNotice] = useState({ type: '', text: '' });
  const grades = normalizeGrades(getStoredItem('unisphere_grades_db', initialGrades));

  const checkStatus = async () => {
    const res = await checkEmailServerStatus();
    setServerStatus({ checked: true, online: res.configured || res.status === 'ready', message: res.message });
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailTo || !emailTo.includes('@')) {
      setEmailNotice({ type: 'error', text: 'Masukkan alamat email penerima yang valid!' });
      return;
    }
    setSendingEmail(true);
    setEmailNotice({ type: '', text: '' });
    try {
      const studentData = {
        name: currentUser?.name || 'Alex Morgan',
        nim: currentUser?.nim || '220010984',
        major: currentUser?.major || 'Computer Science',
        cgpa: `${Number(grades.summary?.cgpa ?? 0).toFixed(2)} / 4.00`,
        attendanceRate: '93.5%',
        pendingTasks: 3
      };
      const result = await sendAcademicEmail({
        to: emailTo,
        type: emailType,
        message: customMessage,
        studentData
      });
      setEmailNotice({ type: 'success', text: result.message || 'Email berhasil dikirim via Gmail SMTP!' });
    } catch (err) {
      setEmailNotice({
        type: 'error',
        text: err.message.includes('Failed to fetch')
          ? 'Gagal terhubung ke backend server! Pastikan server email berjalan (jalankan: npm run server).'
          : err.message
      });
    } finally {
      setSendingEmail(false);
    }
  };

  useEffect(() => {
    setStoredItem(settingsKey, prefs);
  }, [settingsKey, prefs]);

  const togglePref = (key) => setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (!currentPass) {
      setPasswordNotice({ type: 'error', text: 'Masukkan password saat ini.' });
      return;
    }
    if (newPass.length < 8) {
      setPasswordNotice({ type: 'error', text: 'Password baru harus terdiri dari minimal 8 karakter.' });
      return;
    }
    if (newPass !== confirmPass) {
      setPasswordNotice({ type: 'error', text: 'Konfirmasi password baru tidak cocok.' });
      return;
    }

    try {
      updatePassword(currentPass, newPass);
    } catch (error) {
      setPasswordNotice({ type: 'error', text: error.message });
      return;
    }

    setPasswordNotice({ type: 'success', text: 'Password berhasil diperbarui di penyimpanan browser ini.' });
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setTimeout(() => setPasswordNotice({ type: '', text: '' }), 3000);
  };

  const strength = Math.min(
    [newPass.length >= 8, /[A-Z]/.test(newPass), /\d/.test(newPass), /[^A-Za-z0-9]/.test(newPass)].filter(Boolean).length,
    4
  );
  const strengthLabel = ['', 'Lemah', 'Cukup', 'Kuat', 'Sangat kuat'][strength];
  const strengthColor = ['bg-slate-200', 'bg-rose-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-600'][strength];

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">Pengaturan Portal</h1>
        <p className="text-sm text-slate-400 mt-1">
          Atur notifikasi, password akun, dan sesi login
          {currentUser?.name ? ` untuk ${currentUser.name}` : ''}
        </p>
      </div>

      {/* Notifikasi */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Bell size={18} />
          </span>
          <span>Preferensi Notifikasi</span>
        </h2>

        <div className="space-y-2">
          {NOTIFICATION_ITEMS.map((item) => (
            <div
              key={item.key}
              className="p-4 rounded-2xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <span className="text-xl">{item.emoji}</span>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
              <Toggle checked={prefs[item.key]} onChange={() => togglePref(item.key)} label={item.title} />
            </div>
          ))}
        </div>
      </div>

      {/* Layanan Pengiriman Email SMTP */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-purple-100 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Mail size={18} />
            </span>
            <div>
              <span>Kirim Email Akademik (SMTP Gmail)</span>
              <span className="block text-[11px] font-normal text-slate-400 mt-0.5">
                Mengirim email resmi via Nodemailer & Google SMTP
              </span>
            </div>
          </h2>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${serverStatus.online
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
            >
              <span className={`w-2 h-2 rounded-full ${serverStatus.online ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
              <span>{serverStatus.online ? 'Server SMTP Siap' : 'Server Belum Aktif'}</span>
            </span>

            <button
              type="button"
              onClick={checkStatus}
              title="Refresh status server"
              className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {emailNotice.text && (
          <div
            role="status"
            className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in ${emailNotice.type === 'error'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
          >
            {emailNotice.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
            <span>{emailNotice.text}</span>
          </div>
        )}

        <form onSubmit={handleSendEmail} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">Alamat Email Penerima</label>
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                className={passwordInput}
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Akun pengirim: <strong>hibbertsurentu@gmail.com</strong>
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">Tipe Email Akademik</label>
              <select
                value={emailType}
                onChange={(e) => setEmailType(e.target.value)}
                className={passwordInput}
              >
                <option value="digest">📊 Ringkasan Akademik & IPK (Weekly Digest)</option>
                <option value="exam_slip">📋 Kartu Peserta Ujian UTS (Exam Slip)</option>
                <option value="custom">✉️ Pesan Khusus (Custom Academic Notice)</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Template otomatis dengan format HTML rapi & logo UniSphere
              </span>
            </div>
          </div>

          {emailType === 'custom' && (
            <div className="animate-fade-in">
              <label className="text-xs font-bold text-slate-600 block mb-1.5">Isi Pesan Khusus</label>
              <textarea
                rows={3}
                placeholder="Tulis pesan pengumuman atau catatan akademik di sini..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className={passwordInput}
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-slate-400">
              Jalankan backend dengan <code className="bg-slate-100 px-1 py-0.5 rounded text-purple-700 font-mono">npm run server</code> jika status belum aktif.
            </p>

            <button
              type="submit"
              disabled={sendingEmail}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
            >
              {sendingEmail ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Kirim Email Sekarang</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Keamanan */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-sm space-y-5">
        <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <ShieldCheck size={18} />
          </span>
          <span>Keamanan & Kata Sandi</span>
        </h2>

        {passwordNotice.text && (
          <div
            role="status"
            className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in ${passwordNotice.type === 'error'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
          >
            {passwordNotice.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
            <span>{passwordNotice.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
          <div>
            <label htmlFor="current-password" className="text-xs font-bold text-slate-600 block mb-1.5">Password Saat Ini</label>
            <input
              id="current-password"
              type="password"
              placeholder="••••••••"
              required
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              className={passwordInput}
            />
          </div>

          <div>
            <label htmlFor="new-password" className="text-xs font-bold text-slate-600 block mb-1.5">Password Baru</label>
            <input
              id="new-password"
              type="password"
              placeholder="••••••••"
              minLength={8}
              required
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className={passwordInput}
            />
            {newPass && (
              <div className="mt-2">
                <div className="grid grid-cols-4 gap-1">
                  {[1, 2, 3, 4].map((n) => (
                    <span
                      key={n}
                      className={`h-1.5 rounded-full transition-colors ${n <= strength ? strengthColor : 'bg-slate-200'}`}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">Kekuatan: {strengthLabel || 'Sangat lemah'}</span>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirm-password" className="text-xs font-bold text-slate-600 block mb-1.5">Konfirmasi Password Baru</label>
            <input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              required
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className={passwordInput}
            />
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-extrabold transition-all shadow-lg shadow-purple-600/25 hover:-translate-y-0.5"
          >
            Perbarui Password
          </button>
        </form>
      </div>

      {/* Logout */}
      <div className="bg-gradient-to-r from-rose-50 to-white rounded-3xl p-6 lg:p-8 border border-rose-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-rose-900">Keluar dari Sesi Akademik</h3>
          <p className="text-xs text-rose-600/80 mt-0.5">Mengakhiri sesi login akun ini di browser.</p>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Keluar dari UniSphere Student Portal?')) {
              logout();
            }
          }}
          className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/25 hover:-translate-y-0.5"
        >
          <LogOut size={16} />
          <span>Keluar Sekarang</span>
        </button>
      </div>
    </div>
  );
};
