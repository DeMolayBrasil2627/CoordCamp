import React, { useState, useMemo, useEffect } from 'react';
import { 
  PlusCircle, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft, 
  Sparkles,
  AlertCircle,
  UserCheck
} from 'lucide-react';
import { Correction, CorrectionStatus, User } from '../types';
import { availableCampaigns, brazilianStates, getCampaignLogo, getCampaignEntityLabels } from '../data';

interface NewCorrectionProps {
  currentUser: User;
  users: User[];
  onSaveCorrection: (newCorrection: Correction) => Promise<Correction> | void;
  onNavigateToDashboard: () => void;
}

export const NewCorrection: React.FC<NewCorrectionProps> = ({
  currentUser,
  users,
  onSaveCorrection,
  onNavigateToDashboard,
}) => {
  const isCampaignRestricted =
    (currentUser.roleType === 'Coordenador Geral' || currentUser.roleType === 'Coordenador') &&
    Boolean(currentUser.campaign);

  const canAssignCoordinator =
    currentUser.roleType === 'Admin Master' ||
    currentUser.roleType === 'MCN' ||
    currentUser.roleType === 'Secretário' ||
    currentUser.roleType === 'Coordenador Geral';

  const allowedStates =
    currentUser.roleType === 'Coordenador' &&
    currentUser.states &&
    currentUser.states.length > 0
      ? currentUser.states
      : brazilianStates;

  // Form state
  const [campaign, setCampaign] = useState(
    isCampaignRestricted && currentUser.campaign ? currentUser.campaign : availableCampaigns[0]
  );
  const [activity, setActivity] = useState('');
  const [castleName, setCastleName] = useState('');
  const [castleNumber, setCastleNumber] = useState<string>('');
  const [state, setState] = useState(allowedStates[0] || brazilianStates[0]);
  const [score, setScore] = useState<string>('9.0');
  const [status, setStatus] = useState<CorrectionStatus>('Aprovada');
  const [assignedToSisdmid, setAssignedToSisdmid] = useState<string>(
    currentUser.roleType === 'Coordenador' ? currentUser.sisdmid : ''
  );
  const [evaluatorNotes, setEvaluatorNotes] = useState('');

  // Coordenadores disponíveis para a campanha selecionada
  const campaignCoordinators = useMemo(() => {
    return users.filter(
      (u) =>
        (u.roleType === 'Coordenador' || u.roleType === 'Coordenador Geral') &&
        u.campaign === campaign
    );
  }, [users, campaign]);

  useEffect(() => {
    if (currentUser.roleType === 'Coordenador') {
      setAssignedToSisdmid(currentUser.sisdmid);
    } else {
      setAssignedToSisdmid('');
    }
  }, [campaign, currentUser]);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState<Correction | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const entityLabels = getCampaignEntityLabels(campaign);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Basic validation
    if (!activity.trim() || !castleName.trim() || !castleNumber) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 10) {
      setErrorMessage('A nota deve ser um valor numérico entre 0.0 e 10.0.');
      return;
    }

    const numCastle = parseInt(castleNumber, 10);
    if (isNaN(numCastle) || numCastle <= 0) {
      setErrorMessage(`O ${entityLabels.numberLabel.toLowerCase()} deve ser um valor positivo válido.`);
      return;
    }

    // Save to DB / state
    setIsLoading(true);

    const assignedUser =
      currentUser.roleType === 'Coordenador'
        ? currentUser
        : users.find((u) => u.sisdmid === assignedToSisdmid);

    setTimeout(async () => {
      const nowIso = new Date().toISOString();
      const createdItem: Correction = {
        id: `cor-${Date.now()}`,
        campaign,
        activity: activity.trim(),
        castleName: castleName.trim(),
        castleNumber: numCastle,
        state,
        score: parseFloat(numScore.toFixed(1)),
        status,
        createdAt: nowIso.split('T')[0],
        updatedAt: nowIso,
        updatedBy: currentUser.name,
        assignedTo: assignedUser?.sisdmid,
        assignedToName: assignedUser?.name,
        evaluatorNotes: evaluatorNotes.trim() || 'Avaliação registrada via painel de coordenação.',
      };

      // Add to main state / DB
      const savedResult = await onSaveCorrection(createdItem);

      // Reset form fields
      setActivity('');
      setCastleName('');
      setCastleNumber('');
      setScore('9.0');
      setStatus('Aprovada');
      setEvaluatorNotes('');

      // Show success screen
      setIsLoading(false);
      setSuccessData(savedResult || createdItem);
    }, 500);
  };

  const handleResetForAnother = () => {
    setSuccessData(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onNavigateToDashboard}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors p-1 -ml-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Dashboard</span>
        </button>

        <span className="text-xs text-slate-400 font-medium">
          Módulo de Lançamento de Notas
        </span>
      </div>

      {/* Success banner/modal when saved */}
      {successData ? (
        <div className="bg-white rounded-3xl border border-emerald-200/80 shadow-xl p-8 sm:p-10 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Correção Registrada com Sucesso!
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
            A avaliação de <strong>{successData.castleName} nº {successData.castleNumber}</strong> para a <strong>{successData.campaign}</strong> foi salva no sistema.
          </p>

          {/* Quick Recap Card */}
          <div className="mt-6 max-w-md mx-auto bg-slate-50 rounded-2xl p-4 border border-slate-200/70 text-left text-xs space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60">
              <div className="w-12 h-12 rounded-xl bg-white p-1.5 flex-shrink-0 flex items-center justify-center border border-slate-200/80 shadow-xs">
                <img 
                  src={getCampaignLogo(successData.campaign)} 
                  alt={successData.campaign}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-slate-400 font-semibold">Campanha</p>
                <p className="font-bold text-slate-900 truncate">{successData.campaign}</p>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="font-bold text-slate-800">{successData.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Nota Atribuída:</span>
              <span className="font-extrabold text-indigo-600 text-sm">{successData.score.toFixed(1)} / 10.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Estado:</span>
              <span className="font-bold text-slate-800">{successData.state}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Atividade:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[200px]">{successData.activity}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onNavigateToDashboard}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all cursor-pointer"
            >
              Ver no Dashboard
            </button>
            <button
              onClick={handleResetForAnother}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer"
            >
              Cadastrar Outra Correção
            </button>
          </div>
        </div>
      ) : (
        /* Form Card */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Card Title */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-indigo-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Nova Avaliação de Atividade</h2>
                <p className="text-xs text-indigo-200/80 mt-0.5">
                  Preencha os dados da atividade do Castelo para consolidar a nota e parecer.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Campaign & Activity Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Identificação da Campanha
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Campanha (Select) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Campanha *
                  </label>
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 p-1 flex-shrink-0 flex items-center justify-center border border-slate-200/80 shadow-xs">
                      <img 
                        src={getCampaignLogo(campaign)} 
                        alt={campaign}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <select
                      value={campaign}
                      onChange={(e) => setCampaign(e.target.value)}
                      disabled={isCampaignRestricted}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 transition-all font-medium disabled:opacity-75 disabled:cursor-not-allowed"
                      required
                    >
                      {(isCampaignRestricted && currentUser.campaign
                        ? [currentUser.campaign]
                        : availableCampaigns
                      ).map((camp) => (
                        <option key={camp} value={camp}>
                          {camp}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Atividade (Text) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Atividade Avaliada *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Doação de Sangue, Oficina de Liderança..."
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 transition-all placeholder-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Atribuição de Coordenador da Campanha */}
              {canAssignCoordinator && (
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                  <label className="block text-xs font-bold text-indigo-950 mb-1.5 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    <span>Atribuir Atividade a um Coordenador ({campaign})</span>
                  </label>
                  <select
                    value={assignedToSisdmid}
                    onChange={(e) => setAssignedToSisdmid(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-medium"
                  >
                    <option value="">Sem atribuição específica (Geral da Campanha)</option>
                    {campaignCoordinators.map((coord) => (
                      <option key={coord.id} value={coord.sisdmid}>
                        {coord.name} ({coord.roleType}
                        {coord.states && coord.states.length > 0
                          ? ` [UFs: ${coord.states.join(', ')}]`
                          : ''}{' '}
                        - SISDMID: {coord.sisdmid})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {campaignCoordinators.length > 0
                      ? 'O coordenador selecionado verá esta atividade em seu painel de atividades.'
                      : 'Nenhum coordenador cadastrado para esta campanha ainda. Cadastre em "Gestão de Usuários".'}
                  </p>
                </div>
              )}
            </div>

            <hr className="border-slate-100" />

            {/* Entity Data Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {entityLabels.sectionTitle}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Nome (Text) */}
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {entityLabels.nameLabel} *
                  </label>
                  <input
                    type="text"
                    placeholder={entityLabels.namePlaceholder}
                    value={castleName}
                    onChange={(e) => setCastleName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 transition-all placeholder-slate-400"
                    required
                  />
                </div>

                {/* Número (Number) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {entityLabels.numberLabel} *
                  </label>
                  <input
                    type="number"
                    placeholder={entityLabels.numberPlaceholder}
                    min="1"
                    value={castleNumber}
                    onChange={(e) => setCastleNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 transition-all"
                    required
                  />
                </div>

                {/* Estado (Select) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Estado (UF) *
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 transition-all font-medium"
                    required
                  >
                    {allowedStates.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Score & Status Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                3. Resultado da Avaliação
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Nota (Number) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Nota (0.0 a 10.0) *
                    </label>
                    <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {score || '0.0'} pts
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 transition-all font-bold"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Insira a pontuação com base nos critérios da campanha.
                  </p>
                </div>

                {/* Status (Select) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Status da Correção *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as CorrectionStatus)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 transition-all font-medium"
                    required
                  >
                    <option value="Aprovada">Aprovada (Pontuação aceita)</option>
                    <option value="Devolvida">Devolvida (Necessita ajustes)</option>
                    <option value="Recusada">Recusada (Não atendeu critérios)</option>
                    <option value="Aguardando Revisão">Aguardando Revisão (Pendente)</option>
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Define a situação imediata da submissão no painel.
                  </p>
                </div>
              </div>

              {/* Parecer / Observações */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Parecer do Avaliador / Justificativa (Opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Comente pontos fortes, justificativa da nota ou itens que precisam de ajuste caso devolvida..."
                  value={evaluatorNotes}
                  onChange={(e) => setEvaluatorNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 transition-all placeholder-slate-400 resize-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onNavigateToDashboard}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-200 hover:shadow-lg disabled:opacity-70 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processando Avaliação...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Salvar Correção</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
