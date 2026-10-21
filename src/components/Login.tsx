import React, { useState } from 'react';
import { Lock, User as UserIcon, Eye, EyeOff, LogIn, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { User } from '../types';
import { emblemaGNLogo } from '../data';
import { authenticateUser } from '../lib/supabase';

interface LoginProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ users, onLoginSuccess }) => {
  const [sisdmid, setSisdmid] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!sisdmid.trim() || !password.trim()) {
      setErrorMessage('Por favor, informe seu SISDMID e sua senha.');
      return;
    }

    setIsLoading(true);
    try {
      const authenticated = await authenticateUser(sisdmid, password, users);
      if (authenticated) {
        onLoginSuccess(authenticated);
      } else {
        setErrorMessage('SISDMID ou senha inválidos. Verifique suas credenciais.');
      }
    } catch {
      setErrorMessage('Ocorreu um erro ao validar o acesso. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 antialiased">
      {/* Subtle decorative glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-500/15 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-violet-500/15 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Top Banner */}
        <div className="px-8 pt-8 pb-6 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white p-2.5 mx-auto flex items-center justify-center border border-slate-200/80 shadow-md mb-4">
            <img
              src={emblemaGNLogo}
              alt="Gabinete Nacional"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Acesso Restrito à Coordenação</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            GNMiau - Campanhas
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Entre com seu <strong>SISDMID</strong> e senha para gerenciar avaliações
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SISDMID Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              SISDMID (ID DeMolay)
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                inputMode="numeric"
                placeholder="Ex: 135126"
                value={sisdmid}
                onChange={(e) => setSisdmid(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 font-semibold placeholder-slate-400 transition-all"
                autoFocus
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 font-semibold placeholder-slate-400 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-200 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Entrar no Sistema</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            Gabinete Nacional da Liderança Juvenil • Sistema de Avaliações
          </p>
        </div>
      </div>
    </div>
  );
};

