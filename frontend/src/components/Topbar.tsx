'use client';

import { Search } from 'lucide-react';
import Image from 'next/image';

export default function Topbar() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm rounded-b-lg">
      {/* Logo ou nome do sistema */}

      {/* Campo de busca */}
      <div className="relative w-1/3">
        <input
          type="text"
          placeholder="Digite o que deseja consultar"
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      </div>

      {/* Avatar e info do usuário */}
      <div className="flex items-center gap-3">
        <Image
          src="/perfil_jh.jpg" // Substitua pelo caminho correto da imagem ou avatar padrão
          alt="Usuário"
          width={36}
          height={36}
          className="rounded-full"
        />
        <div className="text-sm">
          <p className="font-medium text-gray-800">João Lafetá</p>
          <p className="text-gray-500">Gerente comercial</p>
        </div>
      </div>
    </header>
  );
}
