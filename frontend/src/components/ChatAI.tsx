'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, X, Loader2 } from 'lucide-react';
import axios from 'axios';

interface Mensagem {
  remetente: 'user' | 'bot';
  texto: string;
  hora: string;
}

export default function ChatAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [historico, setHistorico] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(false);
  const mensagensRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mensagensRef.current) {
      mensagensRef.current.scrollTop = mensagensRef.current.scrollHeight;
    }
  }, [historico, isOpen]);

  const enviarMensagem = async () => {
    if (!mensagem.trim()) return;

    const horaAtual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const novaMensagem: Mensagem = { remetente: 'user', texto: mensagem, hora: horaAtual };
    setHistorico((prev) => [...prev, novaMensagem]);
    setMensagem('');
    setLoading(true);

    try {
      const res = await axios.post('/api/v1/chat', { pergunta: mensagem });
      setHistorico((prev) => [
        ...prev,
        { remetente: 'bot', texto: res.data.resposta, hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
    } catch {
      setHistorico((prev) => [
        ...prev,
        { remetente: 'bot', texto: 'Erro ao responder. Tente novamente.', hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-50"
          aria-label="Abrir chat"
        >
          <Bot className="w-6 h-6 animate-pulse" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 bg-white border border-gray-300 rounded-lg shadow-xl z-50 flex flex-col">
          {/* Topo */}
          <div className="flex items-center justify-between px-4 py-2 bg-blue-600 text-white">
            <span className="font-semibold text-sm">wAIse</span>
            <button onClick={() => setIsOpen(false)} aria-label="Fechar chat">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mensagens */}
          <div
            ref={mensagensRef}
            className="flex-1 overflow-y-auto p-3 space-y-2 text-sm bg-gray-50"
            style={{ maxHeight: '400px' }}
          >
            {historico.map((m, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg max-w-[85%] relative ${
                  m.remetente === 'user'
                    ? 'bg-blue-100 text-right self-end ml-auto'
                    : 'bg-gray-200 text-left'
                }`}
              >
                <div>{m.texto}</div>
                <div className="text-[0.65rem] text-gray-400 mt-1">{m.hora}</div>
              </div>
            ))}

            {loading && (
              <div className="text-gray-400 text-xs flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Carregando...
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-2 border-t flex items-center gap-2">
            <input
              type="text"
              placeholder="Digite sua mensagem..."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && enviarMensagem()}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={enviarMensagem}
              disabled={loading}
              className="text-sm text-blue-600 font-medium hover:underline disabled:opacity-50"
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
