import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Bell, 
  Menu, 
  X,
  ExternalLink,
  ChevronRight,
  LogOut,
  Users
} from 'lucide-react';
import { User } from '../types';
import { emblemaGNLogo, canAccessUserManagement } from '../data';

export type NavTab = 'dashboard' | 'new-correction' | 'users';

interface LayoutProps {
  currentUser: User;
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  currentUser,
  activeTab,
  onNavigate,
  onLogout,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800 antialiased">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center p-1 border border-slate-200/80 shadow-xs">
            <img src={emblemaGNLogo} alt="Gabinete Nacional" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-base tracking-tight leading-none">GNMiau</h1>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Gestão de Campanhas</p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Abrir menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand Logo & Name */}
          <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center p-1.5 border border-slate-200/80 shadow-sm">
                <img src={emblemaGNLogo} alt="Gabinete Nacional" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg text-slate-900 tracking-tight">GNMiau</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">Gabinete</span>
                </div>
                <p className="text-xs font-medium text-slate-400">Avaliação de Campanhas</p>
              </div>
            </div>
            {/* Close button for mobile inside sidebar */}
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-4 py-6 flex-1 space-y-1.5">
            <div className="px-3 mb-2">
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Módulos</span>
            </div>

            <button
              onClick={() => {
                onNavigate('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                  activeTab === 'dashboard' ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                }`} />
                <span>Dashboard Geral</span>
              </div>
              {activeTab === 'dashboard' && <ChevronRight className="w-4 h-4 text-indigo-200" />}
            </button>

            <button
              onClick={() => {
                onNavigate('new-correction');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                activeTab === 'new-correction'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <PlusCircle className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                  activeTab === 'new-correction' ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                }`} />
                <span>Nova Correção</span>
              </div>
              {activeTab === 'new-correction' && <ChevronRight className="w-4 h-4 text-indigo-200" />}
            </button>

            {canAccessUserManagement(currentUser) && (
              <button
                onClick={() => {
                  onNavigate('users');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                  activeTab === 'users'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-200'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    activeTab === 'users' ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                  }`} />
                  <span>Gestão de Usuários</span>
                </div>
                {activeTab === 'users' && <ChevronRight className="w-4 h-4 text-indigo-200" />}
              </button>
            )}

            {/* Presentation helper banner in sidebar */}
            <div className="pt-6 px-1">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-violet-50/50 border border-indigo-100/70">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-sm mt-0.5">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Modo Apresentação</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Substituição interativa da antiga planilha Excel. Dados em memória.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Profile Card at Sidebar Bottom */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-sm">
              <div className="relative flex-shrink-0">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-contain bg-slate-50 p-1 ring-2 ring-indigo-500/20"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                <p className="text-[11px] font-semibold text-indigo-600 truncate">{currentUser.role}</p>
                <p className="text-[10px] text-slate-400 truncate">
                  SISDMID: {currentUser.sisdmid}
                  {currentUser.states && currentUser.states.length > 0
                    ? ` • UF: ${currentUser.states.join(', ')}`
                    : ''}
                </p>
              </div>
              <button
                onClick={onLogout}
                title="Sair da conta"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 font-medium">
            <span className="text-slate-400">Castelos & Campanhas</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-semibold capitalize">
              {activeTab === 'dashboard'
                ? 'Painel de Controle'
                : activeTab === 'new-correction'
                ? 'Lançamento de Avaliação'
                : 'Gestão de Usuários & Cargos'}
            </span>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {/* Quick date display */}
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-700">Outubro, 2026</span>
              <span className="text-[11px] text-slate-400">Ciclo Avaliativo Ativo</span>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            {/* Notification bell */}
            <div className="relative">
              <button 
                title="Notificações do Sistema"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Page Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};