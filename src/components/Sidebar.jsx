import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  BarChart3,
  BookOpen,
  CalendarDays,
  Clock,
  Award,
  MessageSquare,
  User,
  Settings,
  LogOut,
  X,
  FileText,
  Layers,
  Archive
} from './Icons';

export const Sidebar = ({ isOpen, onClose }) => {
  const { logout, currentUser, isLecturer } = useAuth();

  const studentNavLinks = [
    { to: '/', label: 'Dashboard', icon: BarChart3, end: true },
    { to: '/courses', label: 'My Courses', icon: BookOpen },
    { to: '/assignments', label: 'Assignments', icon: FileText },
    { to: '/archive', label: 'Arsip Tugas', icon: Archive },
    { to: '/exams', label: 'Examinations', icon: CalendarDays },
    { to: '/attendance', label: 'Attendance', icon: Clock },
    { to: '/grades', label: 'Grades & GPA', icon: Award },
    { to: '/messages', label: 'AI Assistant', icon: MessageSquare, badge: 'Gemini' },
    { to: '/profile', label: 'Student Profile', icon: User },
    { to: '/architecture', label: 'Architecture', icon: Layers },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  const lecturerNavLinks = [
    { to: '/lecturer', label: 'Dashboard Dosen', icon: BarChart3, end: true },
    { to: '/courses', label: 'Mata Kuliah', icon: BookOpen },
    { to: '/assignments', label: 'Tugas Mahasiswa', icon: FileText },
    { to: '/archive', label: 'Arsip Pengumpulan', icon: Archive },
    { to: '/messages', label: 'AI Assistant', icon: MessageSquare, badge: 'Gemini' },
    { to: '/architecture', label: 'Architecture', icon: Layers },
    { to: '/settings', label: 'Settings & SMTP', icon: Settings }
  ];

  const navLinks = isLecturer ? lecturerNavLinks : studentNavLinks;

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 overflow-y-auto overscroll-contain bg-white border-r border-slate-100 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'
          }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <NavLink to={isLecturer ? '/lecturer' : '/'} className="flex items-center gap-3" onClick={onClose}>
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/30 animate-float">
                <GraduationCap size={24} />
              </div>
              <div>
                <span className="text-lg font-black text-slate-800 tracking-tight block leading-none">
                  UniSphere
                </span>
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mt-1 block">
                  {isLecturer ? '👨‍🏫 Lecturer Portal' : '🎓 Student Portal'}
                </span>
              </div>
            </NavLink>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-230px)]">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                      : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Footer */}
        <div className="shrink-0 p-4 pb-6 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3 mb-3 p-2 bg-white rounded-xl border border-slate-100 shadow-xs">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
              alt={currentUser?.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-600/30"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-800 truncate">{currentUser?.name || 'Alex Morgan'}</h4>
              <p className="text-[10px] text-purple-700 font-bold truncate">
                {isLecturer ? `Dosen • NIP: ${currentUser?.nip || '19890820'}` : `Mahasiswa • ${currentUser?.major || 'Computer Science'}`}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Log out from UniSphere session?')) {
                logout();
              }
            }
            }
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div >
      </aside >
    </>
  );
};

