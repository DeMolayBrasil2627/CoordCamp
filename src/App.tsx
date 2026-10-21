import React, { useState, useEffect } from 'react';
import { Layout, NavTab } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { NewCorrection } from './components/NewCorrection';
import { UserManagement } from './components/UserManagement';
import { Login } from './components/Login';
import { canAccessUserManagement, initialCorrections, initialUsers } from './data';
import { Correction, User } from './types';
import {
  fetchCorrectionsFromDb,
  insertCorrectionInDb,
  updateCorrectionInDb,
  deleteCorrectionFromDb,
  fetchUsersFromDb,
  insertUserInDb,
  deleteUserFromDb,
  isSupabaseConfigured,
} from './lib/supabase';

const SESSION_STORAGE_KEY = 'gnmiau_logged_user';
const LOCAL_USERS_STORAGE_KEY = 'gnmiau_users_list';

export const App: React.FC = () => {
  const [loggedUser, setLoggedUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!saved) return null;
      const parsed = JSON.parse(saved) as User;
      if (!parsed.roleType) {
        parsed.roleType = parsed.role === 'Admin Master' ? 'Admin Master' : 'Coordenador';
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_USERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as User[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return initialUsers;
  });

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [corrections, setCorrections] = useState<Correction[]>(initialCorrections);

  const saveUsersLocally = (updatedList: User[]) => {
    setUsers(updatedList);
    try {
      localStorage.setItem(LOCAL_USERS_STORAGE_KEY, JSON.stringify(updatedList));
    } catch {
      // ignore
    }
  };

  const handleLoginSuccess = (user: User) => {
    setLoggedUser(user);
    setActiveTab('dashboard');
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  };

  const handleLogout = () => {
    setLoggedUser(null);
    setActiveTab('dashboard');
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const loadInitialData = async () => {
      try {
        const dbUsers = await fetchUsersFromDb();
        if (dbUsers && dbUsers.length > 0) {
          saveUsersLocally(dbUsers);
        }
      } catch (err) {
        console.warn('Usando lista local de usuários:', err);
      }

      if (!loggedUser) return;

      try {
        const dbCorrections = await fetchCorrectionsFromDb();
        if (dbCorrections) {
          setCorrections(dbCorrections);
        }
      } catch (err) {
        console.warn('Usando avaliações locais:', err);
      }
    };

    loadInitialData();
  }, [loggedUser]);

  const handleCreateUser = async (newUser: User): Promise<User> => {
    if (isSupabaseConfigured) {
      try {
        const createdInDb = await insertUserInDb(newUser);
        if (createdInDb) {
          const updated = [...users, createdInDb];
          saveUsersLocally(updated);
          return createdInDb;
        }
      } catch (err) {
        console.warn('Salvando usuário localmente (fallback):', err);
      }
    }

    const updated = [...users, newUser];
    saveUsersLocally(updated);
    return newUser;
  };

  const handleDeleteUser = async (userId: string): Promise<void> => {
    if (isSupabaseConfigured) {
      try {
        await deleteUserFromDb(userId);
      } catch (err) {
        console.warn('Removendo usuário localmente (fallback):', err);
      }
    }
    const updated = users.filter((u) => u.id !== userId);
    saveUsersLocally(updated);
  };

  const handleSaveCorrection = async (newCorrection: Correction): Promise<Correction> => {
    if (isSupabaseConfigured) {
      try {
        const savedInDb = await insertCorrectionInDb(newCorrection);
        if (savedInDb) {
          setCorrections((prev) => [savedInDb, ...prev]);
          return savedInDb;
        }
      } catch (err) {
        console.error('Erro ao salvar no banco, mantendo no estado local:', err);
      }
    }
    setCorrections((prev) => [newCorrection, ...prev]);
    return newCorrection;
  };

  const handleUpdateCorrection = async (updatedCorrection: Correction): Promise<void> => {
    if (isSupabaseConfigured) {
      try {
        const savedInDb = await updateCorrectionInDb(updatedCorrection);
        if (savedInDb) {
          setCorrections((prev) =>
            prev.map((item) => (item.id === savedInDb.id ? savedInDb : item))
          );
          return;
        }
      } catch (err) {
        console.error('Erro ao atualizar no banco, atualizando no estado local:', err);
      }
    }
    setCorrections((prev) =>
      prev.map((item) => (item.id === updatedCorrection.id ? updatedCorrection : item))
    );
  };

  const handleDeleteCorrection = async (correctionId: string): Promise<void> => {
    if (isSupabaseConfigured) {
      try {
        await deleteCorrectionFromDb(correctionId);
      } catch (err) {
        console.error('Erro ao excluir no banco, excluindo localmente:', err);
      }
    }
    setCorrections((prev) => prev.filter((item) => item.id !== correctionId));
  };

  if (!loggedUser) {
    return <Login users={users} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Layout
      currentUser={loggedUser}
      activeTab={activeTab}
      onNavigate={(tab) => setActiveTab(tab)}
      onLogout={handleLogout}
    >
      {activeTab === 'dashboard' && (
        <Dashboard
          corrections={corrections}
          currentUser={loggedUser}
          users={users}
          onNavigateToNew={() => setActiveTab('new-correction')}
          onUpdateCorrection={handleUpdateCorrection}
          onDeleteCorrection={handleDeleteCorrection}
        />
      )}

      {activeTab === 'new-correction' && (
        <NewCorrection
          currentUser={loggedUser}
          users={users}
          onSaveCorrection={handleSaveCorrection}
          onNavigateToDashboard={() => setActiveTab('dashboard')}
        />
      )}

      {activeTab === 'users' && canAccessUserManagement(loggedUser) && (
        <UserManagement
          currentUser={loggedUser}
          users={users}
          onCreateUser={handleCreateUser}
          onDeleteUser={handleDeleteUser}
        />
      )}
    </Layout>
  );
};

export default App;
