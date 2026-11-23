import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { NetworkBanner } from './components/common/NetworkBanner';
import { ToastContainer } from './components/layout/ToastContainer';
import { WalletModal } from './components/wallet/WalletModal';
import { ClaimModal } from './components/task/ClaimModal';
import { WelcomePage } from './components/onboarding/WelcomeModal';
import { LandingPage } from './pages/LandingPage';
import { ExplorePage } from './pages/ExplorePage';
import { TaskDetailsPage } from './pages/TaskDetailsPage';
import { CreateTaskPage } from './pages/CreateTaskPage';
import { DashboardPage } from './pages/DashboardPage';
import { useTasks } from './context/TaskContext';
import { Task } from './types';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'explore' | 'create' | 'dashboard' | 'details'>('landing');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [claimTargetTask, setClaimTargetTask] = useState<Task | null>(null);
  const [welcomeOpen, setWelcomeOpen] = useState(
    () => localStorage.getItem('taskvault_onboarding_complete_v1') !== 'true'
  );

  const {
    tasks,
    filteredTasks,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    sortBy,
    setSortBy,
    claimTask,
  } = useTasks();

  const handleSelectTask = (task: Task) => {
    setSelectedTaskId(task.id);
    setCurrentView('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClaimTask = (task: Task) => {
    setClaimTargetTask(task);
  };

  const handleNavigate = (view: 'landing' | 'explore' | 'create' | 'dashboard') => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const completeWelcome = (audience: 'company' | 'hunter') => {
    localStorage.setItem('taskvault_onboarding_complete_v1', 'true');
    localStorage.setItem('taskvault_audience', audience);
    setWelcomeOpen(false);
    handleNavigate('landing');
  };

  const skipWelcome = () => {
    localStorage.setItem('taskvault_onboarding_complete_v1', 'true');
    setWelcomeOpen(false);
  };

  if (welcomeOpen) {
    return <WelcomePage onChoose={completeWelcome} onSkip={skipWelcome} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100">
      {/* Top Solana Devnet Alert Banner */}
      <NetworkBanner />

      {/* Main Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenWalletModal={() => setWalletModalOpen(true)}
      />

      {/* Main View Render */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            tasks={tasks}
            onNavigate={handleNavigate}
            onSelectTask={handleSelectTask}
            onClaimTask={handleClaimTask}
          />
        )}

        {currentView === 'explore' && (
          <ExplorePage
            tasks={filteredTasks}
            allTasks={tasks}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onSelectTask={handleSelectTask}
            onClaimTask={handleClaimTask}
            onCreateClick={() => handleNavigate('create')}
          />
        )}

        {currentView === 'details' && selectedTaskId && (
          <TaskDetailsPage
            taskId={selectedTaskId}
            onBack={() => handleNavigate('explore')}
          />
        )}

        {currentView === 'create' && (
          <CreateTaskPage
            onSuccess={(newTaskId) => {
              setSelectedTaskId(newTaskId);
              setCurrentView('details');
            }}
            onCancel={() => handleNavigate('explore')}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardPage
            onSelectTask={handleSelectTask}
            onClaimTask={handleClaimTask}
            onCreateClick={() => handleNavigate('create')}
            onExploreClick={() => handleNavigate('explore')}
            onOpenWalletModal={() => setWalletModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Modals & Overlays */}
      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />

      <ClaimModal
        task={claimTargetTask}
        isOpen={claimTargetTask !== null}
        onClose={() => setClaimTargetTask(null)}
        onConfirmClaim={async (taskId) => {
          await claimTask(taskId);
          setClaimTargetTask(null);
        }}
      />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};
