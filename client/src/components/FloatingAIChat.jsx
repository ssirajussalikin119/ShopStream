import { useEffect, useRef, useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { aiAPI } from '../utils/api';

const FloatingAIChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hi! I can help you find products, answer store questions, and guide you through ShopStream.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (open) scrollToBottom();
  }, [messages, open]);

  const handleSend = async (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((current) => [...current, { role: 'user', content: trimmed }]);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const response = await aiAPI.sendMessage(trimmed);
      const reply = response?.data?.reply || 'Sorry, I could not generate a response right now.';
      setMessages((current) => [...current, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error(err);
      setError(err?.message || err?.error || 'Unable to connect to AI chat. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <div
        className={`shadow-2xl transition-all duration-300 ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        style={{ minWidth: '320px', maxWidth: '420px' }}
      >
        <div className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          <div className="flex items-center justify-between bg-blue-600 px-4 py-3 text-white">
            <div>
              <p className="font-semibold">ShopStream AI</p>
              <p className="text-xs text-blue-100">Ask about products, deals, or orders.</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="text-white opacity-90 hover:opacity-100">
              <X size={20} />
            </button>
          </div>
          <div className="flex h-[420px] flex-col bg-slate-50 p-4">
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-900 border border-slate-200'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {error && <div className="rounded-2xl bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>}

            <form onSubmit={handleSend} className="mt-3 flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                rows={2}
                className="min-h-[70px] flex-1 resize-none rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-[70px] min-w-[80px] items-center justify-center rounded-3xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {loading ? '...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-xl transition hover:bg-blue-700"
      >
        <MessageSquare size={18} />
        {open ? 'Close AI' : 'Chat with AI'}
      </button>
    </div>
  );
};

export default FloatingAIChat;
