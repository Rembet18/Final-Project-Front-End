import { X, Check, Bell, Calendar, Award, AlertCircle, FileText } from './Icons';

export const NotificationPanel = ({
  isOpen,
  onClose,
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'exam':
        return <Calendar size={16} className="text-purple-600" />;
      case 'deadline':
        return <AlertCircle size={16} className="text-amber-600" />;
      case 'grade':
        return <Award size={16} className="text-emerald-600" />;
      case 'announcement':
        return <FileText size={16} className="text-blue-600" />;
      default:
        return <Bell size={16} className="text-purple-600" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Bell size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Notifications</h2>
                <p className="text-xs text-slate-400">
                  {unreadCount > 0 ? `${unreadCount} unread academic alerts` : 'All alerts are up to date'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Subheader action */}
          {unreadCount > 0 && (
            <div className="px-5 py-2.5 bg-purple-50/50 flex items-center justify-between border-b border-purple-100/50">
              <span className="text-xs font-semibold text-purple-800">Unread ({unreadCount})</span>
              <button
                onClick={onMarkAllAsRead}
                className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
              >
                <Check size={12} />
                <span>Mark all as read</span>
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50 p-3 space-y-1">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">No notifications available.</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.read && onMarkAsRead && onMarkAsRead(notif.id)}
                  className={`p-3.5 rounded-xl transition-all cursor-pointer flex items-start gap-3 ${
                    notif.read ? 'bg-white hover:bg-slate-50 opacity-70' : 'bg-purple-50/40 hover:bg-purple-50/80 border border-purple-100/60'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-white shadow-xs border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{notif.title}</h4>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">{notif.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{notif.message}</p>
                  </div>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center">
            <span className="text-[11px] text-slate-400 font-medium">
              Academic Alerts & Official University Communications
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

