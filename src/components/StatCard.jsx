export const StatCard = ({
  icon: Icon,
  title,
  value,
  subtext,
  badgeText,
  badgeColor = 'purple',
  iconColor = 'text-purple-600',
  iconBg = 'bg-purple-50'
}) => {
  const badgeClasses = {
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <div className="dashboard-stat-card bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-200 ${iconBg} ${iconColor}`}>
          {Icon && <Icon size={24} />}
        </div>
        {badgeText && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeClasses[badgeColor] || badgeClasses.purple}`}>
            {badgeText}
          </span>
        )}
      </div>

      <div>
        <div className="text-2xl font-extrabold text-slate-800 tracking-tight">{value}</div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{title}</div>
        {subtext && <div className="text-xs text-slate-400 mt-2 font-medium">{subtext}</div>}
      </div>
    </div>
  );
};
