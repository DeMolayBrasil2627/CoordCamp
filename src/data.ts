import { User, Correction } from './types';

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

export const currentUser: User = {
  id: 'usr-001',
  name: 'Pedro Cruz',
  email: 'pedro.cruz@organizacao.org.br',
  role: 'Coordenador Estadual - PR',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
};

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
  'PR', 'SP', 'SC', 'RS', 'RJ', 'MG', 'BA', 'GO', 'DF', 'ES', 'PE', 'CE'
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
    evaluatorNotes: 'Grande engajamento com participação ativa de 4 capítulos e 2 castelos da região.',
  },
];
