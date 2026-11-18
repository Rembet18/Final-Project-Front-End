import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, Menu, Sparkles } from './Icons';
import { getStoredItem } from '../utils/storage';
import initialAssignments from '../data/assignments.json';
import { getCourses } from '../utils/courses';

export const Navbar = ({ onOpenNotifications, unreadCount = 0, onToggleMobileSidebar }) => {
  const { currentUser, isLecturer } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const normalizedQuery = query.trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (!normalizedQuery) return [];

    const courses = getCourses();
    const assignments = getStoredItem('unisphere_assignments_db', initialAssignments);
    const courseResults = courses
      .filter((course) =>
        [
          course.code,
          course.name,
          course.lecturer,
          course.description,
          ...(Array.isArray(course.syllabus) ? course.syllabus : [])
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)
      )
      .map((course) => ({
        id: course.id,
        title: course.name,
        subtitle: `${course.code} • Mata kuliah`,
        path: '/courses'
      }));
    const assignmentResults = assignments
      .filter((assignment) =>
        [assignment.title, assignment.courseName, assignment.courseCode, assignment.description]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)
      )
      .map((assignment) => ({
        id: assignment.id,
        title: assignment.title,
        subtitle: `${assignment.courseCode} • Tugas`,
        path: '/assignments'
      }));

    return [...courseResults, ...assignmentResults].slice(0, 6);
  }, [normalizedQuery]);

  const openSearchResult = (result) => {
    navigate(`${result.path}?q=${encodeURIComponent(query.trim())}`);
    setQuery('');
    setSearchOpen(false);
  };

  return (
    <header className="app-navbar sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Search bar */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
            aria-label="Toggle navigation"
          >
            <Menu size={20} />
          </button>

          <div className="relative w-full hidden sm:block">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              aria-label="Cari mata kuliah atau tugas"
              aria-expanded={searchOpen && normalizedQuery.length > 0}
              aria-controls="global-search-results"
              placeholder="Cari mata kuliah, tugas, atau silabus..."
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setSearchOpen(false);
                if (event.key === 'Enter' && searchResults[0]) {
                  event.preventDefault();
                  openSearchResult(searchResults[0]);
                }
              }}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all"
            />
            {searchOpen && normalizedQuery && (
              <div
                id="global-search-results"
                role="listbox"
                className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
              >
                {searchResults.length ? (
                  searchResults.map((result) => (
                    <button
                      key={`${result.path}-${result.id}`}
                      type="button"
                      role="option"
                      aria-selected="false"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => openSearchResult(result)}
                      className="w-full rounded-lg px-3 py-2 text-left hover:bg-purple-50 transition-colors"
                    >
                      <span className="block truncate text-xs font-bold text-slate-700">{result.title}</span>
                      <span className="block text-[10px] text-slate-400">{result.subtitle}</span>
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-2 text-xs text-slate-500">Tidak ada hasil yang cocok.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Academic Assistant shortcut, Notification Bell, User Avatar */}
        <div className="flex items-center gap-3">
          {/* Quick AI Assistant Link */}
          <Link
            to="/messages"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold transition-all"
            title="Chat with AI Academic Assistant"
          >
            <Sparkles size={14} className="text-purple-600" />
            <span>AI Tutor</span>
          </Link>

          {/* Notification Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-purple-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Profile pill */}
          <Link
            to="/profile"
            className="flex items-center gap-2.5 pl-2 py-1 pr-3 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
          >
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
              alt={currentUser?.name || 'Student'}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-600/30"
            />
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {currentUser?.name || 'Alex Morgan'}
              </div>
              <div className="text-[10px] font-semibold text-purple-600">
                {isLecturer ? `Dosen (NIP: ${currentUser?.nip || '19890820'})` : `NIM: ${currentUser?.nim || '220010984'}`}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};
