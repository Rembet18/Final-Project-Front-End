import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, Sparkles, RefreshCw } from '../components/Icons';
import { sendGeminiMessage } from '../services/gemini';
import { getStoredItem, setStoredItem } from '../utils/storage';

const STORAGE_KEY_CHAT = 'unisphere_academic_chat_history';

const PROMPT_STARTERS = [
  {
    icon: '💡',
    title: 'Virtual DOM React 19',
    prompt: 'Explain the internal architecture of React 19 Virtual DOM and how reconciliation works.'
  },
  {
    icon: '🗄️',
    title: 'Normalisasi BCNF',
    prompt: 'Explain the difference between 3NF and BCNF normalization with a simple university example.'
  },
  {
    icon: '🌐',
    title: 'TCP vs UDP',
    prompt: 'Compare TCP and UDP transport protocols and explain when to choose each for web apps.'
  },
  {
    icon: '📝',
    title: 'Latihan Kuis',
    prompt: 'Generate a short 3-question practice quiz for Computer Science midterm preparation.'
  }
];

const nowTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/* ---------- Renderer markdown ringan (heading, bold, list, code) ---------- */
const renderInline = (text, keyPrefix) =>
  text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={`${keyPrefix}-${i}`} className="font-extrabold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={`${keyPrefix}-${i}`} className="px-1.5 py-0.5 rounded-md bg-slate-200/70 text-purple-700 font-mono text-[11px]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });

const MessageContent = ({ text, isUser }) => {
  const lines = String(text || '').split('\n');
  const blocks = [];
  let inCode = false;
  let codeBuffer = [];

  lines.forEach((line, idx) => {
    if (line.trim().startsWith('```')) {
      if (inCode) {
        blocks.push(
          <pre
            key={`code-${idx}`}
            className="bg-slate-900 text-emerald-300 p-3 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed"
          >
            {codeBuffer.join('\n')}
          </pre>
        );
        codeBuffer = [];
      }
      inCode = !inCode;
      return;
    }
    if (inCode) {
      codeBuffer.push(line);
      return;
    }
    if (!line.trim()) {
      blocks.push(<div key={`sp-${idx}`} className="h-1" />);
      return;
    }
    const heading = line.match(/^#{1,4}\s+(.*)/);
    if (heading) {
      blocks.push(
        <h4 key={`h-${idx}`} className={`text-sm font-black ${isUser ? 'text-white' : 'text-slate-900'}`}>
          {renderInline(heading[1], `h${idx}`)}
        </h4>
      );
      return;
    }
    const bullet = line.match(/^\s*[-*]\s+(.*)/);
    if (bullet) {
      blocks.push(
        <div key={`b-${idx}`} className="flex items-start gap-2 pl-1">
          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${isUser ? 'bg-white/70' : 'bg-purple-500'}`} />
          <span>{renderInline(bullet[1], `b${idx}`)}</span>
        </div>
      );
      return;
    }
    blocks.push(<p key={`p-${idx}`}>{renderInline(line, `p${idx}`)}</p>);
  });

  return <div className="space-y-1.5">{blocks}</div>;
};

export const Messages = () => {
  const { currentUser } = useAuth();
  const chatBottomRef = useRef(null);
  const chatStorageKey = `${STORAGE_KEY_CHAT}_${currentUser?.id || 'anonymous'}`;

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState(() =>
    getStoredItem(chatStorageKey, [
      {
        id: 'msg-init-1',
        sender: 'ai',
        text: `### 🎓 Halo ${currentUser?.name?.split(' ')[0] || 'Alex'}!
Saya **Asisten Akademik AI UniSphere** (ditenagai Google Gemini).

Saya bisa membantu kamu dengan:
- **Konsep pemrograman & arsitektur web**
- **Penjelasan database & jaringan**
- **Membuat kuis latihan & persiapan ujian**
- **Merangkum materi kuliah**

Tulis pertanyaan di bawah atau klik salah satu contoh prompt!`,
        timestamp: nowTime(),
        isSimulation: false
      }
    ])
  );

  useEffect(() => {
    setStoredItem(chatStorageKey, messages);
  }, [chatStorageKey, messages]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || loading) return;

    const userMessage = { id: `msg-${Date.now()}`, sender: 'user', text: text.trim(), timestamp: nowTime() };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setLoading(true);

    try {
      const result = await sendGeminiMessage(text.trim(), messages);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'ai',
          text: result.text,
          timestamp: nowTime(),
          isSimulation: result.isSimulation
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'ai',
          text: 'Terjadi gangguan jaringan saat menghubungi asisten. Silakan coba kirim ulang pertanyaanmu.',
          timestamp: nowTime(),
          isSimulation: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Hapus seluruh riwayat percakapan dengan Asisten Akademik AI?')) {
      const initial = [
        {
          id: `msg-${Date.now()}`,
          sender: 'ai',
          text: 'Riwayat chat sudah dihapus. Ada yang bisa saya bantu terkait mata kuliahmu hari ini?',
          timestamp: nowTime(),
          isSimulation: false
        }
      ];
      setMessages(initial);
      setStoredItem(STORAGE_KEY_CHAT, initial);
    }
  };

  const showStarters = messages.length <= 1;

  return (
    <div className="space-y-4 animate-fade-in flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 via-fuchsia-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Asisten Akademik AI</h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                Gemini
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Tutor interaktif, pembuat kuis, dan panduan konsep mata kuliah
            </p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="px-3 py-2 text-slate-500 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors text-xs font-bold flex items-center gap-1.5"
          title="Reset percakapan"
        >
          <RefreshCw size={14} />
          <span className="hidden sm:inline">Hapus Chat</span>
        </button>
      </div>

      {/* Chat container */}
      <div className="flex-1 bg-gradient-to-b from-white to-purple-50/30 rounded-3xl border border-slate-100 shadow-sm p-4 lg:p-6 overflow-y-auto space-y-5 flex flex-col">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-3xl animate-slide-up ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden ${
                  isUser
                    ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-200'
                    : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/30'
                }`}
              >
                {isUser ? (
                  <img
                    src={
                      currentUser?.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
                    }
                    alt="Kamu"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Sparkles size={17} />
                )}
              </div>

              <div
                className={`px-4 py-3.5 rounded-3xl text-xs leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-tr-md shadow-md shadow-purple-600/20'
                    : 'bg-white text-slate-700 rounded-tl-md border border-slate-100 shadow-sm'
                }`}
              >
                <MessageContent text={msg.text} isUser={isUser} />

                <div
                  className={`mt-2.5 text-[10px] flex items-center justify-between gap-3 pt-1.5 border-t ${
                    isUser ? 'border-white/20 text-purple-200' : 'border-slate-100 text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {!isUser && msg.isSimulation && (
                    <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                      Mode Offline
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3 mr-auto max-w-sm animate-fade-in">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Sparkles size={16} className="animate-pulse" />
            </div>
            <div className="px-4 py-3 bg-white rounded-3xl rounded-tl-md border border-slate-100 shadow-sm text-xs text-slate-500 flex items-center gap-2.5">
              <span className="flex items-center gap-1">
                {[0, 150, 300].map((d) => (
                  <span
                    key={d}
                    className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce"
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </span>
              <span>Gemini sedang menyiapkan jawaban...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Prompt starters */}
      {showStarters && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 shrink-0">
          {PROMPT_STARTERS.map((starter) => (
            <button
              key={starter.title}
              onClick={() => handleSendMessage(starter.prompt)}
              disabled={loading}
              className="p-3 rounded-2xl bg-white hover:bg-purple-50/70 border border-slate-100 hover:border-purple-300 text-left transition-all shadow-xs hover:shadow-md hover:-translate-y-0.5 group disabled:opacity-50"
            >
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 group-hover:text-purple-700 mb-1">
                <span className="text-base">{starter.icon}</span>
                <span className="truncate">{starter.title}</span>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-2 leading-snug">{starter.prompt}</p>
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 shrink-0 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-md focus-within:border-purple-400 focus-within:ring-4 focus-within:ring-purple-600/10 transition-all"
      >
        <input
          type="text"
          placeholder="Tanya apa saja tentang matkul, pemrograman, database, atau ujian..."
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          disabled={loading}
          className="flex-1 bg-transparent px-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />

        <button
          type="submit"
          disabled={!inputPrompt.trim() || loading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/25"
        >
          <span>Kirim</span>
          <Send size={14} />
        </button>
      </form>
    </div>
  );
};
