/**
 * High-fidelity academic visualizations:
 * 1. AttendanceRadialGauge: Circular SVG progress gauge
 * 2. AcademicProgressChart: Cumulative GPA & CGPA trend visualization
 */

export const AttendanceRadialGauge = ({ rate = 93.5, size = 180, strokeWidth = 14 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (rate / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#EDE9FE"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active progress stroke with gradient */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#7C3AED"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Inner Centered Metrics */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{rate}%</span>
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
            Compliant
          </span>
        </div>
      </div>
    </div>
  );
};

export const AcademicProgressChart = ({ progressionData = [] }) => {
  if (!progressionData || progressionData.length === 0) {
    return <div className="text-xs text-slate-400 py-8 text-center">No progression history available.</div>;
  }

  const maxVal = 4.0;
  const chartHeight = 160;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-600 inline-block" />
            <span className="text-slate-600">Cumulative CGPA</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-300 inline-block" />
            <span className="text-slate-600">Semester GPA</span>
          </div>
        </div>
        <span className="text-xs text-slate-400 font-medium">Scale 4.00</span>
      </div>

      {/* Responsive Bar/Progression Visualizer */}
      <div className="grid grid-cols-5 gap-3 pt-4 border-b border-slate-100 pb-2">
        {progressionData.map((item, index) => {
          const cgpaPercent = (item.cgpa / maxVal) * 100;
          const gpaPercent = (item.termGpa / maxVal) * 100;

          return (
            <div key={item.semester || index} className="flex flex-col items-center">
              <div
                className="w-full flex items-end justify-center gap-1.5 relative group"
                style={{ height: chartHeight }}
              >
                {/* Tooltip */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                  GPA: {Number(item.termGpa).toFixed(2)} • CGPA: {Number(item.cgpa).toFixed(2)}
                </div>

                {/* Term GPA Bar */}
                <div
                  className="w-3.5 bg-purple-200 hover:bg-purple-300 rounded-t-sm transition-all duration-500"
                  style={{ height: `${gpaPercent}%` }}
                />

                {/* Cumulative CGPA Bar */}
                <div
                  className="w-3.5 bg-purple-600 hover:bg-purple-700 rounded-t-sm transition-all duration-500 shadow-sm"
                  style={{ height: `${cgpaPercent}%` }}
                />
              </div>

              <div className="mt-2 text-center">
                <div className="text-[11px] font-bold text-slate-700">{Number(item.cgpa).toFixed(2)}</div>
                <div className="text-[10px] text-slate-400 font-medium">Sem {index + 1}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
