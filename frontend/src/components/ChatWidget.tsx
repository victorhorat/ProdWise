'use client';

import { useState } from 'react';

export default function ChatWidget() {
  const [message, setMessage] = useState('');

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-md p-4 z-50">
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        <input
          type="text"
          placeholder="Fale com nossa IA..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => alert('Chat futuro em desenvolvimento')}
          className="bg-blue-500 text-white text-sm px-4 py-2 rounded-full hover:bg-blue-600 transition"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
