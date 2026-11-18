export const Loading = ({ text = 'Loading academic portal...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] w-full p-8 text-center">
      <div className="relative w-12 h-12 mb-4">
        <div className="w-12 h-12 rounded-full border-4 border-purple-100 border-t-purple-600 animate-spin" />
      </div>
      <p className="text-sm font-medium text-slate-500 animate-pulse">{text}</p>
    </div>
  );
};

