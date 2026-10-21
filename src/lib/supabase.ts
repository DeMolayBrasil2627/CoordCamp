import { createClient } from '@supabase/supabase-js';
import { Correction, CorrectionStatus, RoleType, User } from '../types';
import { currentUser as masterAdminUser, emblemaGNLogo, formatUserRoleLabel } from '../data';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '');
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

interface DbCorrectionRow {
  id: string;
  campaign: string;
  activity: string;
  castle_name: string;
  castle_number: number;
  state: string;
  score: number | string;
  status: CorrectionStatus;
  evaluator_notes: string | null;
  assigned_to?: string | null;
  assigned_to_name?: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string;
}

interface DbUserRow {
  id: string;
  sisdmid: string;
  password: string;
  name: string;
  role: string;
  role_type?: RoleType;
  campaign?: string | null;
  states?: string[] | null;
}

const inferRoleType = (row: DbUserRow): RoleType => {
  if (row.role_type) return row.role_type;
  if (row.role === 'Admin Master') return 'Admin Master';
  if (row.role === 'MCN') return 'MCN';
  if (row.role === 'Secretário') return 'Secretário';
  if (row.role.startsWith('Coordenador Geral')) return 'Coordenador Geral';
  return 'Coordenador';
};

const mapRowToUser = (row: DbUserRow): User => {
  const roleType = inferRoleType(row);
  const campaign = row.campaign ?? undefined;
  const states = row.states && row.states.length > 0 ? row.states : undefined;
  return {
    id: row.id,
    sisdmid: row.sisdmid,
    password: row.password,
    name: row.name,
    email: `SISDMID: ${row.sisdmid}`,
    role: row.role || formatUserRoleLabel(roleType, campaign, states),
    roleType,
    campaign,
    states,
    avatarUrl: emblemaGNLogo,
  };
};

const mapRowToCorrection = (row: DbCorrectionRow): Correction => ({
  id: row.id,
  campaign: row.campaign,
  activity: row.activity,
  castleName: row.castle_name,
  castleNumber: Number(row.castle_number),
  state: row.state,
  score: Number(row.score),
  status: row.status,
  evaluatorNotes: row.evaluator_notes ?? undefined,
  assignedTo: row.assigned_to ?? undefined,
  assignedToName: row.assigned_to_name ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  updatedBy: row.updated_by,
});

export const authenticateUser = async (
  sisdmidInput: string,
  passwordInput: string,
  localUsers: User[] = []
): Promise<User | null> => {
  const cleanSisdmid = sisdmidInput.trim();
  const cleanPassword = passwordInput.trim();

  // 1. Tenta autenticar via tabela 'users' no Supabase se configurado
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('sisdmid', cleanSisdmid)
        .eq('password', cleanPassword)
        .maybeSingle();

      if (!error && data) {
        return mapRowToUser(data as DbUserRow);
      }
    } catch (err) {
      console.warn('Verificando credenciais locais (tabela users ainda não acessível):', err);
    }
  }

  // 2. Verifica nos usuários cadastrados localmente / sessão
  const matchedLocal = localUsers.find(
    (u) => u.sisdmid === cleanSisdmid && u.password === cleanPassword
  );
  if (matchedLocal) {
    return matchedLocal;
  }

  // 3. Conta Admin Master garantida (SISDMID: 135126 | Senha: 04052006)
  if (cleanSisdmid === '135126' && cleanPassword === '04052006') {
    return masterAdminUser;
  }

  return null;
};

export const fetchUsersFromDb = async (): Promise<User[] | null> => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erro ao buscar usuários do Supabase:', error.message);
    throw error;
  }

  return (data as DbUserRow[]).map(mapRowToUser);
};

export const insertUserInDb = async (
  newUser: Omit<User, 'id'>
): Promise<User | null> => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('users')
    .insert({
      sisdmid: newUser.sisdmid,
      password: newUser.password || '',
      name: newUser.name,
      role: newUser.role,
      role_type: newUser.roleType,
      campaign: newUser.campaign ?? null,
      states: newUser.states && newUser.states.length > 0 ? newUser.states : null,
    })
    .select('*')
    .single();

  if (error) {
    console.error('Erro ao criar usuário no Supabase:', error.message);
    throw error;
  }

  return mapRowToUser(data as DbUserRow);
};

export const deleteUserFromDb = async (userId: string): Promise<boolean> => {
  if (!supabase) return false;

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) {
    console.error('Erro ao excluir usuário no Supabase:', error.message);
    throw error;
  }

  return true;
};

export const fetchCorrectionsFromDb = async (): Promise<Correction[] | null> => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('corrections')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar avaliações do Supabase:', error.message);
    throw error;
  }

  return (data as DbCorrectionRow[]).map(mapRowToCorrection);
};

export const insertCorrectionInDb = async (
  correction: Omit<Correction, 'id'>
): Promise<Correction | null> => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('corrections')
    .insert({
      campaign: correction.campaign,
      activity: correction.activity,
      castle_name: correction.castleName,
      castle_number: correction.castleNumber,
      state: correction.state,
      score: correction.score,
      status: correction.status,
      evaluator_notes: correction.evaluatorNotes ?? null,
      assigned_to: correction.assignedTo ?? null,
      assigned_to_name: correction.assignedToName ?? null,
      created_at: correction.createdAt,
      updated_at: correction.updatedAt,
      updated_by: correction.updatedBy,
    })
    .select('*')
    .single();

  if (error) {
    console.error('Erro ao inserir avaliação no Supabase:', error.message);
    throw error;
  }

  return mapRowToCorrection(data as DbCorrectionRow);
};

export const updateCorrectionInDb = async (
  correction: Correction
): Promise<Correction | null> => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('corrections')
    .update({
      score: correction.score,
      status: correction.status,
      updated_at: correction.updatedAt,
      updated_by: correction.updatedBy,
      assigned_to: correction.assignedTo ?? null,
      assigned_to_name: correction.assignedToName ?? null,
      evaluator_notes: correction.evaluatorNotes ?? null,
    })
    .eq('id', correction.id)
    .select('*')
    .single();

  if (error) {
    console.error('Erro ao atualizar avaliação no Supabase:', error.message);
    throw error;
  }

  return mapRowToCorrection(data as DbCorrectionRow);
};

export const deleteCorrectionFromDb = async (correctionId: string): Promise<boolean> => {
  if (!supabase) return false;

  const { error } = await supabase
    .from('corrections')
    .delete()
    .eq('id', correctionId);

  if (error) {
    console.error('Erro ao excluir avaliação no Supabase:', error.message);
    throw error;
  }

  return true;
};
