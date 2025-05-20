'use client';

import { useState } from 'react';
import { Bot, X } from 'lucide-react';

export default function ChatAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <>
      {/* Botão flutuante com ícone de robô */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-50"
          aria-label="Abrir chat"
        >
          <Bot className="w-5 h-5" />
        </button>
      )}

      {/* Janela de chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 bg-white border border-gray-300 rounded-lg shadow-xl z-50 flex flex-col overflow-hidden">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between px-4 py-2 bg-blue-600 text-white">
            <span className="font-semibold text-sm">Chat com a IA</span>
            <button onClick={() => setIsOpen(false)} aria-label="Fechar chat">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Corpo do chat */}
          <div className="flex-1 p-4 text-sm text-gray-600">
            👋 Olá! Em breve nosso escravo estara disponivel, envie uma mensagem para saber mais!
          </div>

          {/* Campo de mensagem */}
          <div className="p-2 border-t flex items-center gap-2">
            <input
              type="text"
              placeholder="Digite sua mensagem..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={() => alert('Vitito da o cuzito')}
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
