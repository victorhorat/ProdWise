'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('As senhas não coincidem.');
      return;
    }

    // Simula cadastro (substituir por lógica real)
    if (name && email && password) {
      localStorage.setItem('user', JSON.stringify({ name, email, password }));
      router.push('/Login');
    } else {
      alert('Preencha todos os campos.');
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Lado Esquerdo */}
      <div className="w-1/2 bg-teal-500 flex items-center justify-center p-10 rounded-r-3xl">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="ProdWise Logo" className="h-12" />
          <span className="text-white text-3xl font-bold">ProdWise</span>
        </div>
      </div>

      {/* Lado Direito */}
      <div className="w-1/2 bg-white flex flex-col justify-center px-16">
        <h2 className="text-xl font-semibold text-center mb-6">Crie sua conta</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          <input
            type="password"
            placeholder="Confirmar senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          <button
            type="submit"
            className="w-full bg-teal-400 hover:bg-teal-500 text-white py-2 rounded-full transition"
          >
            Cadastrar
          </button>
        </form>

        <div className="my-6 text-center text-sm text-gray-500">
          Ou cadastre-se com
        </div>

        <div className="space-y-3">
          <button className="w-full border border-gray-300 py-2 rounded-full flex items-center justify-center gap-2 text-sm hover:bg-gray-50">
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-4 h-4"
            />
            Continuar com Google
          </button>

          <button className="w-full border border-gray-300 py-2 rounded-full flex items-center justify-center gap-2 text-sm hover:bg-gray-50">
            <img
              src="https://www.svgrepo.com/show/512317/apple.svg"
              alt="Apple"
              className="w-4 h-4"
            />
            Continuar com Apple
          </button>
        </div>

        <div className="text-center text-sm mt-6 text-gray-600">
          Já tem uma conta?{' '}
          <Link href="/Login" className="text-teal-500 font-medium hover:underline">
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}
