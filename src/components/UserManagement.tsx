import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  Shield,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Users,
  Lock,
  BadgeCheck,
  Sparkles,
  MapPin,
  Plus,
  X,
  ClipboardList,
  Pencil,
  Save,
} from 'lucide-react';
import { RoleType, User } from '../types';
import {
  availableCampaigns,
  brazilianStates,
  canDeleteOrManageUser,
  canEditUser,
  emblemaGNLogo,
  formatUserRoleLabel,
  getCampaignLogo,
  getCreatableRoles,
} from '../data';

interface UserManagementProps {
  currentUser: User;
  users: User[];
  onCreateUser: (newUser: User) => Promise<User> | void;
  onUpdateUser: (updatedUser: User) => Promise<User> | void;
  onDeleteUser: (userId: string) => Promise<void> | void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  currentUser,
  users,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const creatableRoles = useMemo(() => getCreatableRoles(currentUser), [currentUser]);
  const isGeneralCoordinator = currentUser.roleType === 'Coordenador Geral';

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [sisdmid, setSisdmid] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleType>(
    creatableRoles[0] || 'Coordenador'
  );
  const [selectedCampaign, setSelectedCampaign] = useState<string>(
    isGeneralCoordinator && currentUser.campaign
      ? currentUser.campaign
      : availableCampaigns[0]
  );
  const [selectedStates, setSelectedStates] = useState<string[]>(['PR']);
  const [activityInput, setActivityInput] = useState<string>('');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setEditingUser(null);
    setName('');
    setSisdmid('');
    setPassword('');
    setSelectedRole(creatableRoles[0] || 'Coordenador');
    setSelectedCampaign(
      isGeneralCoordinator && currentUser.campaign
        ? currentUser.campaign
        : availableCampaigns[0]
    );
    setSelectedStates(['PR']);
    setActivityInput('');
    setSelectedActivities([]);
  };

  const handleStartEdit = (targetUser: User) => {
    if (!canEditUser(currentUser, targetUser)) return;
    setEditingUser(targetUser);
    setName(targetUser.name);
    setSisdmid(targetUser.sisdmid);
    setPassword(targetUser.password || '');
    setSelectedRole(targetUser.roleType);
    setSelectedCampaign(
      isGeneralCoordinator && currentUser.campaign
        ? currentUser.campaign
        : targetUser.campaign || availableCampaigns[0]
    );
    setSelectedStates(
      targetUser.states && targetUser.states.length > 0 ? [...targetUser.states] : ['PR']
    );
    setActivityInput('');
    setSelectedActivities(
      targetUser.activities && targetUser.activities.length > 0
        ? [...targetUser.activities]
        : []
    );
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleCancelEdit = () => {
    resetForm();
    setErrorMessage('');
    setSuccessMessage('');
  };

  const needsCampaign =
    selectedRole === 'Coordenador Geral' || selectedRole === 'Coordenador';
  const needsStates = selectedRole === 'Coordenador';

  const toggleStateSelection = (uf: string) => {
    setSelectedStates((prev) =>
      prev.includes(uf) ? prev.filter((item) => item !== uf) : [...prev, uf]
    );
  };

  const handleAddActivity = () => {
    const cleanAct = activityInput.trim();
    if (!cleanAct) return;
    if (!selectedActivities.some((a) => a.toLowerCase() === cleanAct.toLowerCase())) {
      setSelectedActivities((prev) => [...prev, cleanAct]);
    }
    setActivityInput('');
  };

  const handleRemoveActivity = (actToRemove: string) => {
    setSelectedActivities((prev) => prev.filter((item) => item !== actToRemove));
  };

  // Filtra usuários visíveis na tabela de acordo com o cargo
  const visibleUsers = useMemo(() => {
    if (isGeneralCoordinator) {
      return users.filter((u) => u.campaign === currentUser.campaign);
    }
    return users;
  }, [users, isGeneralCoordinator, currentUser.campaign]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanName = name.trim();
    const cleanSisdmid = sisdmid.trim();
    const cleanPassword = password.trim();

    if (!cleanName || !cleanSisdmid || (!editingUser && !cleanPassword)) {
      setErrorMessage('Preencha o Nome, SISDMID e Senha para salvar o usuário.');
      return;
    }

    if (editingUser && !canEditUser(currentUser, editingUser)) {
      setErrorMessage('Seu cargo não possui permissão para alterar este usuário.');
      return;
    }

    if (!creatableRoles.includes(selectedRole)) {
      setErrorMessage(
        editingUser
          ? 'Seu cargo não possui permissão para atribuir este nível de usuário.'
          : 'Seu cargo não possui permissão para criar este nível de usuário.'
      );
      return;
    }

    const effectiveCampaign = needsCampaign
      ? isGeneralCoordinator
        ? currentUser.campaign
        : selectedCampaign
      : undefined;

    if (needsCampaign && !effectiveCampaign) {
      setErrorMessage('Selecione a campanha vinculada ao coordenador.');
      return;
    }

    if (needsStates && selectedStates.length === 0) {
      setErrorMessage('Selecione pelo menos um estado (UF) que o coordenador irá coordenar.');
      return;
    }

    if (
      users.some(
        (u) => u.sisdmid === cleanSisdmid && (!editingUser || u.id !== editingUser.id)
      )
    ) {
      setErrorMessage(`Já existe um usuário cadastrado com o SISDMID ${cleanSisdmid}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const effectiveStates = needsStates ? [...selectedStates].sort() : undefined;
      // Caso o usuário tenha digitado algo no input de atividade mas não tenha clicado em "+", inclui automaticamente
      const pendingAct = activityInput.trim();
      const combinedActivities = needsStates
        ? pendingAct && !selectedActivities.some((a) => a.toLowerCase() === pendingAct.toLowerCase())
          ? [...selectedActivities, pendingAct]
          : [...selectedActivities]
        : [];
      const effectiveActivities =
        needsStates && combinedActivities.length > 0 ? combinedActivities : undefined;

      const roleLabel = formatUserRoleLabel(selectedRole, effectiveCampaign, effectiveStates);

      if (editingUser) {
        const updatedUser: User = {
          ...editingUser,
          sisdmid: cleanSisdmid,
          password: cleanPassword || editingUser.password || '',
          name: cleanName,
          email: `SISDMID: ${cleanSisdmid}`,
          role: roleLabel,
          roleType: selectedRole,
          campaign: effectiveCampaign,
          states: effectiveStates,
          activities: effectiveActivities,
          avatarUrl: effectiveCampaign ? getCampaignLogo(effectiveCampaign) : emblemaGNLogo,
        };

        await onUpdateUser(updatedUser);
        resetForm();
        setSuccessMessage(
          `Usuário "${cleanName}" (SISDMID: ${cleanSisdmid}) atualizado com sucesso como ${roleLabel}!`
        );
      } else {
        const newUser: User = {
          id: `usr-${Date.now()}`,
          sisdmid: cleanSisdmid,
          password: cleanPassword,
          name: cleanName,
          email: `SISDMID: ${cleanSisdmid}`,
          role: roleLabel,
          roleType: selectedRole,
          campaign: effectiveCampaign,
          states: effectiveStates,
          activities: effectiveActivities,
          avatarUrl: effectiveCampaign ? getCampaignLogo(effectiveCampaign) : emblemaGNLogo,
        };

        await onCreateUser(newUser);
        resetForm();
        setSuccessMessage(
          `Usuário "${cleanName}" (SISDMID: ${cleanSisdmid}) criado com sucesso como ${roleLabel}!`
        );
      }
    } catch {
      setErrorMessage('Não foi possível salvar o usuário. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeStyle = (roleType: RoleType) => {
    switch (roleType) {
      case 'Admin Master':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'MCN':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Secretário':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Coordenador Geral':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Coordenador':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Gestão de Usuários & Cargos
            </h1>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Hierarquia Ativa
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {isGeneralCoordinator
              ? `Gerencie os Coordenadores da campanha ${currentUser.campaign}.`
              : 'Cadastre e gerencie acessos respeitando a hierarquia de cargos do Gabinete Nacional.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Create / Edit User Form */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-indigo-300">
                    {editingUser ? (
                      <Pencil className="w-5 h-5" />
                    ) : (
                      <UserPlus className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">
                      {editingUser ? `Editar Usuário` : 'Novo Usuário'}
                    </h2>
                    <p className="text-xs text-indigo-200/80">
                      {editingUser ? (
                        <>
                          Alterando: <strong>{editingUser.name}</strong>
                        </>
                      ) : (
                        <>
                          Seu cargo atual: <strong>{currentUser.role}</strong>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                {editingUser && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancelar</span>
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Nome */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  placeholder="Ex: João Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
                  required
                />
              </div>

              {/* SISDMID & Senha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    SISDMID (Login) *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Ex: 142050"
                    value={sisdmid}
                    onChange={(e) => setSisdmid(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {editingUser ? 'Senha *' : 'Senha Inicial *'}
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 123456"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 font-semibold"
                    required={!editingUser}
                  />
                </div>
              </div>

              {/* Cargo / Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Cargo (Respeitando sua Hierarquia) *
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as RoleType)}
                  disabled={creatableRoles.length === 1}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 font-semibold disabled:opacity-75"
                >
                  {creatableRoles.map((roleOpt) => (
                    <option key={roleOpt} value={roleOpt}>
                      {roleOpt === 'Coordenador Geral'
                        ? 'Coordenador Geral de Campanha'
                        : roleOpt === 'Coordenador'
                        ? 'Coordenador de Campanha'
                        : roleOpt}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  {isGeneralCoordinator
                    ? `Como Coordenador Geral, você pode criar Coordenadores para ${currentUser.campaign}.`
                    : `Cargos disponíveis para criação pelo perfil ${currentUser.roleType}.`}
                </p>
              </div>

              {/* Campanha Vinculada (apenas para Coordenador Geral ou Coordenador) */}
              {needsCampaign && (
                <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                  <label className="block text-xs font-bold text-indigo-950">
                    Campanha Vinculada *
                  </label>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white p-1 flex-shrink-0 flex items-center justify-center border border-slate-200">
                      <img
                        src={getCampaignLogo(
                          isGeneralCoordinator && currentUser.campaign
                            ? currentUser.campaign
                            : selectedCampaign
                        )}
                        alt="Logo Campanha"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    {isGeneralCoordinator && currentUser.campaign ? (
                      <input
                        type="text"
                        value={currentUser.campaign}
                        disabled
                        className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold cursor-not-allowed"
                      />
                    ) : (
                      <select
                        value={selectedCampaign}
                        onChange={(e) => setSelectedCampaign(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-semibold"
                      >
                        {availableCampaigns.map((camp) => (
                          <option key={camp} value={camp}>
                            {camp}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Estado(s) que o Coordenador coordena */}
                  {needsStates && (
                    <div className="pt-3 mt-3 border-t border-indigo-100/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-indigo-950 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Estado(s) que Coordena (UF) *</span>
                        </label>
                        <div className="flex items-center gap-2 text-[11px] font-semibold">
                          <button
                            type="button"
                            onClick={() => setSelectedStates([...brazilianStates])}
                            className="text-indigo-600 hover:text-indigo-800 cursor-pointer"
                          >
                            Todos
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => setSelectedStates([])}
                            className="text-slate-500 hover:text-slate-700 cursor-pointer"
                          >
                            Limpar
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                        {brazilianStates.map((uf) => {
                          const isSelected = selectedStates.includes(uf);
                          return (
                            <button
                              key={uf}
                              type="button"
                              onClick={() => toggleStateSelection(uf)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-700'
                              }`}
                            >
                              {uf}
                            </button>
                          );
                        })}
                      </div>

                      <p className="text-[11px] text-indigo-800/80 font-medium">
                        {selectedStates.length > 0
                          ? `Selecionado(s) (${selectedStates.length}): ${selectedStates.join(', ')}`
                          : 'Nenhum estado selecionado. Clique nas siglas acima para atribuir.'}
                      </p>

                      {/* Atividade(s) Específica(s) sob responsabilidade do Coordenador (Opcional) */}
                      <div className="pt-3 mt-3 border-t border-indigo-100/80 space-y-2">
                        <label className="text-xs font-bold text-indigo-950 flex items-center gap-1">
                          <ClipboardList className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Atividade(s) Específica(s) (Opcional)</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Nome da atividade (ex: Doação de Sangue)"
                            value={activityInput}
                            onChange={(e) => setActivityInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddActivity();
                              }
                            }}
                            className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-400"
                          />
                          <button
                            type="button"
                            onClick={handleAddActivity}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer flex-shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Adicionar</span>
                          </button>
                        </div>

                        {selectedActivities.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {selectedActivities.map((act) => (
                              <span
                                key={act}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-800 text-xs font-semibold shadow-2xs"
                              >
                                <span>{act}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveActivity(act)}
                                  className="text-indigo-400 hover:text-rose-600 transition-colors cursor-pointer"
                                  title="Remover atividade"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500">
                            Opcional: adicione 0 ou mais atividades pelas quais este coordenador será responsável.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Permissões Resumo */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Permissões do cargo selecionado:</span>
                </div>
                {selectedRole === 'Admin Master' && (
                  <p>Acesso irrestrito a todas as campanhas, atividades e criação de qualquer cargo.</p>
                )}
                {(selectedRole === 'MCN' || selectedRole === 'Secretário') && (
                  <p>
                    Overview de todas as campanhas, podendo visualizar, criar, editar e excluir atividades de todas as campanhas e criar cargos inferiores.
                  </p>
                )}
                {selectedRole === 'Coordenador Geral' && (
                  <p>
                    Overview exclusivo da campanha selecionada, podendo criar/editar/excluir atividades, atribuir atividades aos coordenadores da campanha e cadastrar novos Coordenadores da sua campanha.
                  </p>
                )}
                {selectedRole === 'Coordenador' && (
                  <p>
                    Overview das suas atividades na campanha vinculada, podendo criar, editar e excluir suas avaliações.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {editingUser && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isSubmitting}
                    className="py-3 px-4 rounded-xl font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancelar</span>
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {editingUser ? (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{isSubmitting ? 'Salvando...' : 'Salvar Alterações'}</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>{isSubmitting ? 'Cadastrando...' : 'Cadastrar Usuário'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Users Table */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Usuários Cadastrados ({visibleUsers.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isGeneralCoordinator
                      ? `Membros vinculados à campanha ${currentUser.campaign}`
                      : 'Todos os membros registrados no sistema'}
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Nome & SISDMID</th>
                    <th className="py-3.5 px-6">Cargo / Campanha</th>
                    <th className="py-3.5 px-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {visibleUsers.map((u) => {
                    const canRemove = canDeleteOrManageUser(currentUser, u);
                    const canEdit = canEditUser(currentUser, u);
                    const isBeingEdited = editingUser?.id === u.id;
                    return (
                      <tr
                        key={u.id}
                        className={`transition-colors ${
                          isBeingEdited
                            ? 'bg-indigo-50/70'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.campaign ? getCampaignLogo(u.campaign) : emblemaGNLogo}
                              alt={u.name}
                              className="w-9 h-9 rounded-xl object-contain bg-slate-50 p-1 border border-slate-200"
                            />
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {u.sisdmid === currentUser.sisdmid && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                                    Você
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 font-medium">
                                SISDMID: <strong>{u.sisdmid}</strong>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getRoleBadgeStyle(
                              u.roleType
                            )}`}
                          >
                            <Shield className="w-3 h-3" />
                            {u.roleType}
                          </span>
                          {u.campaign && (
                            <p className="text-xs text-slate-600 font-semibold mt-1">
                              {u.campaign}
                            </p>
                          )}
                          {u.states && u.states.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 mt-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-0.5 mr-0.5">
                                <MapPin className="w-3 h-3 text-indigo-500" />
                                UF:
                              </span>
                              {u.states.map((uf) => (
                                <span
                                  key={uf}
                                  className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold"
                                >
                                  {uf}
                                </span>
                              ))}
                            </div>
                          )}
                          {u.activities && u.activities.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 mt-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-0.5 mr-0.5">
                                <ClipboardList className="w-3 h-3 text-emerald-600" />
                                Atividades:
                              </span>
                              {u.activities.map((act) => (
                                <span
                                  key={act}
                                  className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold"
                                >
                                  {act}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {canEdit || canRemove ? (
                            <div className="inline-flex items-center justify-end gap-1.5">
                              {canEdit && (
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(u)}
                                  title="Editar usuário"
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  <span>Editar</span>
                                </button>
                              )}
                              {canRemove && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (editingUser?.id === u.id) {
                                      handleCancelEdit();
                                    }
                                    onDeleteUser(u.id);
                                  }}
                                  title="Remover usuário"
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Remover</span>
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                              <BadgeCheck className="w-3.5 h-3.5 text-slate-300" />
                              Protegido
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
