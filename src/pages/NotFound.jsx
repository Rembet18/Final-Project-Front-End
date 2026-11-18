import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight } from '../components/Icons';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 shadow-sm">
        <GraduationCap size={36} />
      </div>
      <span className="text-4xl font-black text-purple-600 mb-2">404</span>
      <h1 className="text-xl font-bold text-slate-800 mb-2">Page Not Found</h1>
      <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
        The requested university portal module or page could not be located in this academic session.
      </p>

      <Link
        to="/"
        className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 inline-flex items-center gap-2"
      >
        <span>Return to Dashboard</span>
        <ArrowRight size={14} />
      </Link>
    </div>
  );
};

