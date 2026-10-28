export type CorrectionStatus = 'Aprovada' | 'Recusada' | 'Devolvida' | 'Aguardando Revisão';

export type RoleType =
  | 'Admin Master'
  | 'MCN'
  | 'Secretário'
  | 'Coordenador Geral'
  | 'Coordenador';

export interface User {
  id: string;
  sisdmid: string;
  password?: string;
  name: string;
  email: string;
  role: string;
  roleType: RoleType;
  campaign?: string;
  states?: string[];
  activities?: string[];
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
  updatedAt: string;
  updatedBy: string;
  assignedTo?: string;
  assignedToName?: string;
  evaluatorNotes?: string;
}
