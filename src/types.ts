export type CorrectionStatus = 'Aprovada' | 'Recusada' | 'Devolvida' | 'Aguardando Revisão';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
}

export interface Correction {
  id: string;
  campaign: string;
  activity: string;
  castleName: string;
  castleNumber: number;
  state: string;
  score: number;
  status: CorrectionStatus;
  createdAt: string;
  evaluatorNotes?: string;
}
