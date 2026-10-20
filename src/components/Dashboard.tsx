import React, { useState, useMemo } from 'react';
import { 
  FileCheck2, 
  Award, 
  Clock, 
  Search, 
  PlusCircle, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText,
  MapPin,
  Info,
  X
} from 'lucide-react';
import { Correction, CorrectionStatus } from '../types';
import { getCampaignLogo } from '../data';

interface DashboardProps {
  corrections: Correction[];
  onNavigateToNew: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  corrections, 
  onNavigateToNew 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [selectedCorrection, setSelectedCorrection] = useState<Correction | null>(null);

  // Computed metrics
  const stats = useMemo(() => {
    const total = corrections.length;
    const pending = corrections.filter(c => c.status === 'Aguardando Revisão').length;
    const approved = corrections.filter(c => c.status === 'Aprovada').length;
    const averageScore = total > 0 
      ? (corrections.reduce((acc, curr) => acc + curr.score, 0) / total).toFixed(1)
      : '0.0';

    return { total, pending, approved, averageScore };
  }, [corrections]);

  // Filtered corrections
  const filteredCorrections = useMemo(() => {
    return corrections.filter(item => {
      const matchesSearch = 
        item.castleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.campaign.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.castleNumber.toString().includes(searchTerm);

      const matchesStatus = statusFilter === 'Todos' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [corrections, searchTerm, statusFilter]);

  // Helper for status badge styling
  const renderStatusBadge = (status: CorrectionStatus) => {
    switch (status) {
      case 'Aprovada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Aprovada
          </span>
        );
      case 'Recusada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            Recusada
          </span>
        );
      case 'Devolvida':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            Devolvida
          </span>
        );
      case 'Aguardando Revisão':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            Aguardando Revisão
          </span>
        );
    }
  };

  // Helper for score color
  const getScoreBadgeClass = (score: number) => {
    if (score >= 9.0) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 7.0) return 'text-indigo-700 bg-indigo-50 border-indigo-200';
    if (score >= 5.0) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Painel de Avaliações
            </h1>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Tempo Real
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Acompanhamento centralizado de atividades dos Castelos e pontuações de campanhas.
          </p>
        </div>

        <button
          onClick={onNavigateToNew}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-200 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nova Correção</span>
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total de Correções */}
        <div className="relative overflow-hidden bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              Total de Correções
            </span>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <FileCheck2 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{stats.total}</span>
            <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              {stats.approved} aprovadas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Registros submetidos para o ciclo de 2026
          </p>
        </div>

        {/* Média de Notas */}
        <div className="relative overflow-hidden bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              Média de Notas
            </span>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{stats.averageScore}</span>
            <span className="text-xs font-medium text-slate-400">/ 10.0</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div 
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (Number(stats.averageScore) / 10) * 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Desempenho geral ponderado dos Castelos
          </p>
        </div>

        {/* Aguardando Revisão */}
        <div className="relative overflow-hidden bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              Aguardando Revisão
            </span>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{stats.pending}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
              Pendentes
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Requerem validação ou parecer final
          </p>
        </div>
      </div>

      {/* Table Section with Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Top Controls: Search & Status Pills */}
        <div className="p-5 md:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por Castelo, Campanha, Atividade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {['Todos', 'Aprovada', 'Devolvida', 'Recusada', 'Aguardando Revisão'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === status
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Castelo</th>
                <th className="py-3.5 px-4">UF</th>
                <th className="py-3.5 px-6">Campanha & Atividade</th>
                <th className="py-3.5 px-6 text-center">Nota</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Data</th>
                <th className="py-3.5 px-6 text-right">Parecer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredCorrections.length > 0 ? (
                filteredCorrections.map((item) => (
                  <tr 
                    key={item.id}
                    className="hover:bg-indigo-50/30 transition-colors group cursor-pointer"
                    onClick={() => setSelectedCorrection(item)}
                  >
                    {/* Castle Name and Number */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {item.castleName}
                      </div>
                      <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[11px] font-semibold">
                          Nº {item.castleNumber}
                        </span>
                      </div>
                    </td>

                    {/* State */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {item.state}
                      </span>
                    </td>

                    {/* Campaign & Activity */}
                    <td className="py-4 px-6 max-w-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 p-1 flex-shrink-0 flex items-center justify-center border border-slate-200/80 shadow-xs">
                          <img 
                            src={getCampaignLogo(item.campaign)} 
                            alt={item.campaign}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate" title={item.campaign}>
                            {item.campaign}
                          </p>
                          <p className="text-xs text-slate-500 truncate mt-0.5" title={item.activity}>
                            {item.activity}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Score */}
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block font-extrabold text-xs px-2.5 py-1 rounded-lg border ${getScoreBadgeClass(item.score)}`}>
                        {item.score.toFixed(1)}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      {renderStatusBadge(item.status)}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 text-xs text-slate-500 whitespace-nowrap font-medium">
                      {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCorrection(item);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/80 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Ver detalhes</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="w-8 h-8 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-600">Nenhuma avaliação encontrada</p>
                      <p className="text-xs text-slate-400">Tente ajustar o termo da busca ou o filtro de status selecionado.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-3.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Exibindo <strong>{filteredCorrections.length}</strong> de <strong>{corrections.length}</strong> correções cadastradas</span>
          <span className="text-[11px] text-slate-400 italic">Atualizado recentemente</span>
        </div>
      </div>

      {/* Details Modal */}
      {selectedCorrection && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                  Detalhes da Avaliação
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {selectedCorrection.castleName} - Nº {selectedCorrection.castleNumber} ({selectedCorrection.state})
                </h3>
              </div>
              <button 
                onClick={() => setSelectedCorrection(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 p-1.5 flex-shrink-0 flex items-center justify-center border border-slate-200/80 shadow-xs">
                    <img 
                      src={getCampaignLogo(selectedCorrection.campaign)} 
                      alt={selectedCorrection.campaign}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-400">Campanha</p>
                    <p className="font-bold text-slate-900 mt-0.5 truncate" title={selectedCorrection.campaign}>
                      {selectedCorrection.campaign}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400">Atividade</p>
                  <p className="font-medium text-slate-800 mt-0.5">{selectedCorrection.activity}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-400">Nota Final</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`text-base font-extrabold px-3 py-1 rounded-lg border ${getScoreBadgeClass(selectedCorrection.score)}`}>
                      {selectedCorrection.score.toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-400">de 10.0</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400">Status Atual</p>
                  <div className="mt-1">
                    {renderStatusBadge(selectedCorrection.status)}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-indigo-500" />
                  Parecer do Avaliador / Observações
                </p>
                <div className="mt-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                  {selectedCorrection.evaluatorNotes || 'Nenhuma observação informada.'}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedCorrection(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
