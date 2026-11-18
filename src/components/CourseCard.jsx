import { BookOpen, Clock, MapPin, ChevronRight, User } from './Icons';

export const CourseCard = ({ course, onOpenDetails }) => {
  const colorMap = {
    purple: {
      bar: 'bg-purple-600',
      badge: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    emerald: {
      bar: 'bg-emerald-600',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    indigo: {
      bar: 'bg-indigo-600',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    blue: {
      bar: 'bg-blue-600',
      badge: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    amber: {
      bar: 'bg-amber-600',
      badge: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    rose: {
      bar: 'bg-rose-600',
      badge: 'bg-rose-50 text-rose-700 border-rose-200'
    }
  };

  const scheme = colorMap[course.color] || colorMap.purple;

  return (
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm card-hover-lift flex flex-col justify-between group">
        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${scheme.badge}`}>
              {course.code} • {course.credits} SKS
            </span>
            <span className="text-xs font-semibold text-slate-500">{course.progress}% Completed</span>
          </div>

          <h3 className="text-base font-bold text-slate-800 group-hover:text-purple-600 transition-colors line-clamp-2 mb-2">
            {course.name}
          </h3>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
            <div
              className={`h-full rounded-full transition-all duration-500 ${scheme.bar}`}
              style={{ width: `${course.progress}%` }}
            />
          </div>

          {/* Course Details */}
          <div className="space-y-2 text-xs text-slate-500 mb-5">
            <div className="flex items-center gap-2">
              <User size={14} className="text-slate-400 shrink-0" />
              <span className="truncate font-medium">{course.lecturer}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-slate-400 shrink-0" />
              <span className="truncate">{course.schedule}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-slate-400 shrink-0" />
              <span className="truncate">{course.room}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onOpenDetails && onOpenDetails(course)}
          className="w-full py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5"
        >
          <BookOpen size={14} />
          <span>View Syllabus & Tasks</span>
          <ChevronRight size={14} />
        </button>
      </div>
      );
};

