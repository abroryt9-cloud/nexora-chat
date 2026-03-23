import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, User, Circle } from 'lucide-react';
import './styles/globals.css';
import './styles/animations.css';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  time: number;
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [username, setUsername] = useState(() => 
    localStorage.getItem('nexora_username') || `User_${Math.random().toString(36).substr(2, 6)}`
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('nexora_username', username);
  }, [username]);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || window.location.origin.replace('http', 'ws').replace('https', 'wss');
    const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
    
    console.log('[WebSocket] Connecting to:', wsUrl);
    
    const socketInstance = io(apiUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketInstance.on('connect', () => {
      console.log('[WebSocket] Connected:', socketInstance.id);
      setConnected(true);
      socketInstance.emit('auth', { userId: username });
    });

    socketInstance.on('disconnect', () => {
      console.log('[WebSocket] Disconnected');
      setConnected(false);
    });

    socketInstance.on('auth_ok', (data) => {
      console.log('[WebSocket] Auth OK:', data);
    });

    socketInstance.on('message', (data: Message) => {
      console.log('[WebSocket] Message received:', data);
      setMessages(prev => [...prev, data]);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!socket || !inputText.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      senderId: username,
      senderName: username,
      time: Date.now(),
    };

    socket.emit('message', message);
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      {/* Stars background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-sm bg-white/5">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-xl font-bold">N</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Nexora
              </h1>
              <p className="text-xs text-gray-400">Космический мессенджер</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Circle 
                className={`w-2 h-2 ${connected ? 'text-green-400' : 'text-red-400'}`}
                fill="currentColor"
              />
              <span className="text-gray-400">
                {connected ? 'Подключено' : 'Отключено'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <User className="w-4 h-4 text-purple-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-24 text-center"
                placeholder="Имя"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-6" style={{ height: 'calc(100vh - 180px)' }}>
        <div className="h-full overflow-y-auto space-y-4 scrollbar scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                  <Send className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Добро пожаловать в Nexora!</h3>
                <p className="text-gray-400 max-w-md">
                  Отправьте первое сообщение в этом космическом чате. 
                  Ваши сообщения появятся здесь.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.senderId === username;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-message`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      isOwn
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-md'
                        : 'bg-white/10 backdrop-blur-sm border border-white/10 rounded-bl-md'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium ${isOwn ? 'text-white/80' : 'text-purple-400'}`}>
                        {msg.senderName}
                      </span>
                      <span className="text-xs text-gray-400">{formatTime(msg.time)}</span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="relative z-10 border-t border-white/10 backdrop-blur-sm bg-white/5">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Напишите сообщение..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition placeholder:text-gray-500"
            />
            <button
              onClick={sendMessage}
              disabled={!inputText.trim() || !connected}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-medium hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-105 active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-center text-gray-500 mt-2">
            Нажмите Enter для отправки сообщения
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
