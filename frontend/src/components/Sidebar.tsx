'use client';

import Link from 'next/link';
import {
  Home,
  Box,
  Clock,
  Map,
  FlaskConical,
  Settings,
  LogOut,
} from 'lucide-react';

const menuItems = [
  { icon: <Home size={20} />, label: 'Home', href: '/dashboard' },
  { icon: <Box size={20} />, label: 'Produtos', href: '/produtos' },
  { icon: <Clock size={20} />, label: 'Histórico', href: '/historico' },
  { icon: <Map size={20} />, label: 'Mapa', href: '/mapa' },
  { icon: <FlaskConical size={20} />, label: 'Experimentos', href: '/experimentos' },
  { icon: <Settings size={20} />, label: 'Configurações', href: '/configuracoes' },
  { icon: <LogOut size={20} />, label: 'Sair', href: '/logout' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen fixed top-0 left-0 bg-white shadow-md p-6 flex flex-col justify-between rounded-r-3xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-10 flex items-center gap-2">
          <span className="text-black">🧠</span> ProdWise
        </h2>
        <ul className="space-y-6">
          {menuItems.slice(0, 5).map((item, index) => (
            <li key={index}>
              <Link
                href={item.href}
                className="flex items-center gap-3 text-gray-400 hover:text-gray-800 transition-colors duration-200"
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <ul className="space-y-6 mt-6">
        {menuItems.slice(5).map((item, index) => (
          <li key={index}>
            <Link
              href={item.href}
              className="flex items-center gap-3 text-gray-400 hover:text-gray-800 transition-colors duration-200"
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
