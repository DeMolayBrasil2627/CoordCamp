import { User, Correction, RoleType } from './types';

// Official campaign logos
import cnieCapitulosLogo from './img/CNIE Capítulos.png';
import cnieRegioesLogo from './img/CNIE Regiões.png';
import cnieGabinetesLogo from './img/CNIE Gabinetes.png';
import crnCapitulosLogo from './img/CRN Capítulos.png';
import crnGabinetesLogo from './img/CRN Gabinetes.png';
import canetaDeOuroLogo from './img/Caneta-de-Ouro.png';
import protocolistaDeOuroLogo from './img/SIMBOLO_PROTOCOLISTA_DE_OURO.png';
import dnfLogo from './img/DNF.png';
import drpLogo from './img/DRP.png';
import emblemaGNLogo from './img/EMBLEMA GABINETE NACIONAL fundo vazio.png';
import emblemaDemolayLogo from './img/emblema demolay.png';

export { emblemaGNLogo, emblemaDemolayLogo };

export interface CampaignDefinition {
  name: string;
  logo: string;
  hasCustomLogo: boolean;
}

export const campaignLogos: Record<string, string> = {
  'CNIE Capítulos': cnieCapitulosLogo,
  'CNIE Castelos': emblemaGNLogo,
  'CNIE Priorados': emblemaGNLogo,
  'CNIE Regiões': cnieRegioesLogo,
  'CNIE Gabinetes': cnieGabinetesLogo,
  'CRN - Capítulos': crnCapitulosLogo,
  'CRN Capítulos': crnCapitulosLogo,
  'CRN Castelos': emblemaGNLogo,
  'CRN Priorados': drpLogo,
  'CRN Regiões': emblemaGNLogo,
  'CRN Gabinetes': crnGabinetesLogo,
  'Caneta de Ouro': canetaDeOuroLogo,
  'Protocolista de Ouro': protocolistaDeOuroLogo,
  'Desafio Nacional de Filantropia (DNF)': dnfLogo,
  'Clube de Mães de Honra (CMH)': emblemaDemolayLogo,
};

export const getCampaignLogo = (campaignName: string): string => {
  return campaignLogos[campaignName] || emblemaGNLogo;
};

export interface CampaignEntityLabels {
  entityName: string;
  sectionTitle: string;
  nameLabel: string;
  numberLabel: string;
  namePlaceholder: string;
  numberPlaceholder: string;
}

export const getCampaignEntityLabels = (campaignName: string): CampaignEntityLabels => {
  const chapterCampaigns = [
    'CNIE Capítulos',
    'CRN - Capítulos',
    'CRN Capítulos',
    'Caneta de Ouro',
    'Desafio Nacional de Filantropia (DNF)',
    'Clube de Mães de Honra (CMH)',
  ];

  const prioryCampaigns = [
    'CNIE Priorados',
    'CRN Priorados',
    'Protocolista de Ouro',
  ];

  const cabinetCampaigns = [
    'CNIE Gabinetes',
    'CRN Gabinetes',
  ];

  const regionCampaigns = [
    'CNIE Regiões',
    'CRN Regiões',
  ];

  if (chapterCampaigns.includes(campaignName)) {
    return {
      entityName: 'capítulo',
      sectionTitle: '2. Dados do Capítulo',
      nameLabel: 'Nome Capítulo',
      numberLabel: 'Número Capítulo',
      namePlaceholder: 'Ex: Capítulo Juventude Paranaense',
      numberPlaceholder: 'Ex: 45',
    };
  }

  if (prioryCampaigns.includes(campaignName)) {
    return {
      entityName: 'priorado',
      sectionTitle: '2. Dados do Priorado',
      nameLabel: 'Nome Priorado',
      numberLabel: 'Número Priorado',
      namePlaceholder: 'Ex: Priorado Guardiões do Graal',
      numberPlaceholder: 'Ex: 10',
    };
  }

  if (cabinetCampaigns.includes(campaignName)) {
    return {
      entityName: 'gabinete',
      sectionTitle: '2. Dados do Gabinete',
      nameLabel: 'Nome Gabinete',
      numberLabel: 'Número Gabinete',
      namePlaceholder: 'Ex: Gabinete Estadual do Paraná',
      numberPlaceholder: 'Ex: 1',
    };
  }

  if (regionCampaigns.includes(campaignName)) {
    return {
      entityName: 'região',
      sectionTitle: '2. Dados da Região',
      nameLabel: 'Nome Região',
      numberLabel: 'Número Região',
      namePlaceholder: 'Ex: 1ª Região Administrativa',
      numberPlaceholder: 'Ex: 1',
    };
  }

  return {
    entityName: 'castelo',
    sectionTitle: '2. Dados do Castelo',
    nameLabel: 'Nome Castelo',
    numberLabel: 'Número Castelo',
    namePlaceholder: 'Ex: Castelo da Luz',
    numberPlaceholder: 'Ex: 12',
  };
};

export const formatUserRoleLabel = (
  roleType: RoleType,
  campaign?: string,
  states?: string[]
): string => {
  if ((roleType === 'Coordenador Geral' || roleType === 'Coordenador') && campaign) {
    if (roleType === 'Coordenador' && states && states.length > 0) {
      return `${roleType} (${states.join(', ')}) - ${campaign}`;
    }
    return `${roleType} - ${campaign}`;
  }
  return roleType;
};

export const canAccessUserManagement = (user: User): boolean => {
  return (
    user.roleType === 'Admin Master' ||
    user.roleType === 'MCN' ||
    user.roleType === 'Secretário' ||
    user.roleType === 'Coordenador Geral'
  );
};

export const getCreatableRoles = (user: User): RoleType[] => {
  switch (user.roleType) {
    case 'Admin Master':
      return ['Admin Master', 'MCN', 'Secretário', 'Coordenador Geral', 'Coordenador'];
    case 'MCN':
      return ['Secretário', 'Coordenador Geral', 'Coordenador'];
    case 'Secretário':
      return ['Coordenador Geral', 'Coordenador'];
    case 'Coordenador Geral':
      return ['Coordenador'];
    case 'Coordenador':
    default:
      return [];
  }
};

export const getRoleHierarchyRank = (roleType: RoleType): number => {
  switch (roleType) {
    case 'Admin Master':
      return 5;
    case 'MCN':
      return 4;
    case 'Secretário':
      return 3;
    case 'Coordenador Geral':
      return 2;
    case 'Coordenador':
    default:
      return 1;
  }
};

export const canDeleteOrManageUser = (actor: User, target: User): boolean => {
  if (actor.sisdmid === target.sisdmid) return false;
  if (actor.roleType === 'Admin Master') return true;
  if (actor.roleType === 'Coordenador Geral') {
    return target.roleType === 'Coordenador' && target.campaign === actor.campaign;
  }
  return getRoleHierarchyRank(actor.roleType) > getRoleHierarchyRank(target.roleType);
};

export const canEditUser = (actor: User, target: User): boolean => {
  if (actor.roleType === 'Admin Master') return true;
  if (actor.roleType === 'Coordenador Geral') {
    return target.roleType === 'Coordenador' && target.campaign === actor.campaign;
  }
  return getCreatableRoles(actor).includes(target.roleType);
};

export const currentUser: User = {
  id: 'usr-001',
  sisdmid: '135126',
  password: '04052006',
  name: 'Pedro Cruz',
  email: 'SISDMID: 135126',
  role: 'Admin Master',
  roleType: 'Admin Master',
  avatarUrl: emblemaGNLogo,
};

export const initialUsers: User[] = [currentUser];

export const availableCampaigns: string[] = [
  'CNIE Capítulos',
  'CNIE Castelos',
  'CNIE Priorados',
  'CNIE Regiões',
  'CNIE Gabinetes',
  'CRN - Capítulos',
  'CRN Castelos',
  'CRN Priorados',
  'CRN Regiões',
  'CRN Gabinetes',
  'Caneta de Ouro',
  'Protocolista de Ouro',
  'Desafio Nacional de Filantropia (DNF)',
  'Clube de Mães de Honra (CMH)',
];

export const brazilianStates: string[] = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export const initialCorrections: Correction[] = [
  {
    id: 'cor-101',
    campaign: 'CNIE Castelos',
    activity: 'Instalação e Posse dos Oficiais do Castelo',
    castleName: 'Castelo da Luz',
    castleNumber: 12,
    state: 'PR',
    score: 9.5,
    status: 'Aprovada',
    createdAt: '2026-10-15',
    updatedAt: '2026-10-15T14:30:00.000Z',
    updatedBy: 'Pedro Cruz',
    evaluatorNotes: 'Excelente documentação com fotos, ata de posse completa e assinaturas de todos os presentes.',
  },
  {
    id: 'cor-102',
    campaign: 'Desafio Nacional de Filantropia (DNF)',
    activity: 'Arrecadação Comunitária e Doação para Abrigos',
    castleName: 'Castelo Real de Curitiba',
    castleNumber: 45,
    state: 'PR',
    score: 8.8,
    status: 'Aprovada',
    createdAt: '2026-10-12',
    updatedAt: '2026-10-12T19:15:00.000Z',
    updatedBy: 'Pedro Cruz',
    evaluatorNotes: 'Meta superada em 120%. Ação com grande impacto na comunidade local.',
  },
  {
    id: 'cor-103',
    campaign: 'Caneta de Ouro',
    activity: 'Livro de Atas e Relatório de Tesouraria Trimestral',
    castleName: 'Castelo Pioneiros do Iguaçu',
    castleNumber: 8,
    state: 'PR',
    score: 5.5,
    status: 'Devolvida',
    createdAt: '2026-10-10',
    updatedAt: '2026-10-10T11:20:00.000Z',
    updatedBy: 'Pedro Cruz',
    evaluatorNotes: 'Faltou o extrato bancário conciliado e as assinaturas da comissão de sindicância.',
  },
  {
    id: 'cor-104',
    campaign: 'Protocolista de Ouro',
    activity: 'Execução do Cerimonial e Condução das Sessões',
    castleName: 'Castelo Esperança Verde',
    castleNumber: 103,
    state: 'PR',
    score: 3.0,
    status: 'Recusada',
    createdAt: '2026-10-08',
    updatedAt: '2026-10-08T16:45:00.000Z',
    updatedBy: 'Pedro Cruz',
    evaluatorNotes: 'Vídeo da cerimônia enviado fora do prazo regulamentar do edital sem justificativa prévia.',
  },
  {
    id: 'cor-105',
    campaign: 'CRN Castelos',
    activity: 'Avaliação Ritualística de Nobres Cavaleiros',
    castleName: 'Castelo Guardiões do Litoral',
    castleNumber: 77,
    state: 'PR',
    score: 9.8,
    status: 'Aguardando Revisão',
    createdAt: '2026-10-18',
    updatedAt: '2026-10-18T21:10:00.000Z',
    updatedBy: 'Pedro Cruz',
    evaluatorNotes: 'Pontuação preliminar excepcional. Aguardando homologação pelo Oficial Executivo.',
  },
  {
    id: 'cor-106',
    campaign: 'CNIE Regiões',
    activity: 'Encontro Regional e Treinamento de Lideranças',
    castleName: 'Castelo Nobres do Norte',
    castleNumber: 31,
    state: 'PR',
    score: 9.0,
    status: 'Aprovada',
    createdAt: '2026-10-05',
    updatedAt: '2026-10-05T10:05:00.000Z',
    updatedBy: 'Pedro Cruz',
    evaluatorNotes: 'Grande engajamento com participação ativa de 4 capítulos e 2 castelos da região.',
  },
];
