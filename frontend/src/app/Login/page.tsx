'use client';

import React from 'react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Lado Esquerdo */}
      <div className="w-1/2 bg-teal-500 flex items-center justify-center p-10 rounded-r-3xl">
        <h1 className="text-white text-4xl font-bold">
          <span className="inline-block mr-2">🧠</span> ProdWise
        </h1>
      </div>

      {/* Lado Direito */}
      <div className="w-1/2 bg-white flex flex-col justify-center px-16">
        <h2 className="text-xl font-semibold text-center mb-6">Bem vindo!</h2>

        <form className="space-y-4">
          <input
            type="email"
            placeholder="E-mail"
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          <input
            type="password"
            placeholder="Senha"
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          <div className="flex items-center justify-between text-sm text-gray-600">
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Lembrar de mim
            </label>
            <a href="#" className="hover:underline">
              Esqueceu a senha?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-teal-400 hover:bg-teal-500 text-white py-2 rounded-full transition"
          >
            Entrar
          </button>
        </form>

        <div className="my-6 text-center text-sm text-gray-500">
          Ou faça o login com
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
          Não tem acesso?{' '}
          <a href="Cadastro" className="text-teal-500 font-medium hover:underline">
            Crie sua conta
          </a>
        </div>
      </div>
    </div>
  );
}
