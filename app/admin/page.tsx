'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/lib/stores/admin-auth.store';
import { useAdminLogout } from '@/lib/hooks/admin/useAdminAuth';
import {
  useDashboardState,
  useDashboardFilters,
  useDashboardActions,
} from '@/lib/admin/hooks';
import { TAB_CONFIG, UI_MESSAGES, ROUTES } from '@/lib/admin/constants/dashboard.constants';
import FormValidationModal from '@/components/admin/FormValidationModal';
import DashboardHeader from '@/components/admin/dashboard/DashboardHeader';
import StatsGrid from '@/components/admin/dashboard/StatsGrid';
import TabNavigation from '@/components/admin/dashboard/TabNavigation';
import PendingClientsTable from '@/components/admin/dashboard/PendingClientsTable';
import VerifiedClientsTable from '@/components/admin/dashboard/VerifiedClientsTable';
import AllClientsTable from '@/components/admin/dashboard/AllClientsTable';
import PaginationControls from '@/components/admin/dashboard/PaginationControls';

export default function AdminDashboard() {
  const router = useRouter();
  const user = useAdminAuthStore((state) => state.user);
  const isAuthenticated = useAdminAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAdminAuthStore((state) => state._hasHydrated);
  const logout = useAdminLogout();

  const {
    activeTab,
    currentPage,
    formModalState,
    handleTabChange,
    handlePageChange,
    handleFormModalOpen,
    handleFormModalClose,
  } = useDashboardState();

  const {
    allClientsData,
    pendingPartnerClients,
    pendingResidenceClients,
    pendingEquivalenceClients,
    verificationEntries,
    stats,
    loadingAll,
    loadingPending,
    loadingValidated,
    refetchPending,
  } = useDashboardFilters(currentPage);

  const { handleViewDetails, navigateToClientDetails } = useDashboardActions();

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [hasHydrated, isAuthenticated, router]);

  const handleFormValidationSuccess = () => {
    refetchPending();
  };

  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">{UI_MESSAGES.LOADING.DEFAULT}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: TAB_CONFIG.PENDING_PARTNER.id, label: TAB_CONFIG.PENDING_PARTNER.label, count: stats.pendingPartner },
    { id: TAB_CONFIG.PENDING_RESIDENCE.id, label: TAB_CONFIG.PENDING_RESIDENCE.label, count: stats.pendingResidence },
    { id: TAB_CONFIG.PENDING_EQUIVALENCE.id, label: TAB_CONFIG.PENDING_EQUIVALENCE.label, count: stats.pendingEquivalence },
    { id: TAB_CONFIG.LAST_VERIFIED.id, label: TAB_CONFIG.LAST_VERIFIED.label, count: stats.validatedClients },
    { id: TAB_CONFIG.ALL_CLIENTS.id, label: TAB_CONFIG.ALL_CLIENTS.label, count: stats.totalClients },
  ];

  const renderTable = () => {
    if (activeTab === 'pending-partner') {
      if (loadingPending) return <div className="text-center py-12 text-gray-500">{UI_MESSAGES.LOADING.PARTNER}</div>;
      if (pendingPartnerClients.length === 0) return <div className="text-center py-12 text-gray-500">{UI_MESSAGES.EMPTY.PARTNER}</div>;
      return (
        <PendingClientsTable
          clients={pendingPartnerClients}
          headerColor={TAB_CONFIG.PENDING_PARTNER.headerColor}
          onViewData={handleFormModalOpen}
          onValidate={handleFormModalOpen}
          formType="partner"
        />
      );
    }

    if (activeTab === 'pending-residence') {
      if (loadingPending) return <div className="text-center py-12 text-gray-500">{UI_MESSAGES.LOADING.RESIDENCE}</div>;
      if (pendingResidenceClients.length === 0) return <div className="text-center py-12 text-gray-500">{UI_MESSAGES.EMPTY.RESIDENCE}</div>;
      return (
        <PendingClientsTable
          clients={pendingResidenceClients}
          headerColor={TAB_CONFIG.PENDING_RESIDENCE.headerColor}
          onViewData={handleFormModalOpen}
          onValidate={handleFormModalOpen}
          formType="residence"
        />
      );
    }

    if (activeTab === 'pending-equivalence') {
      if (loadingPending) return <div className="text-center py-12 text-gray-500">{UI_MESSAGES.LOADING.EQUIVALENCE}</div>;
      if (pendingEquivalenceClients.length === 0) return <div className="text-center py-12 text-gray-500">{UI_MESSAGES.EMPTY.EQUIVALENCE}</div>;
      return (
        <PendingClientsTable
          clients={pendingEquivalenceClients}
          headerColor={TAB_CONFIG.PENDING_EQUIVALENCE.headerColor}
          onViewData={handleFormModalOpen}
          onValidate={handleFormModalOpen}
          formType="equivalence"
        />
      );
    }

    if (activeTab === 'last-verified') {
      if (loadingValidated) return <div className="text-center py-12 text-gray-500">{UI_MESSAGES.LOADING.VERIFIED}</div>;
      if (verificationEntries.length === 0) return <div className="text-center py-12 text-gray-500">{UI_MESSAGES.EMPTY.VERIFIED}</div>;
      return <VerifiedClientsTable entries={verificationEntries} onViewDetails={navigateToClientDetails} />;
    }

    if (activeTab === 'all-clients') {
      if (loadingAll) return <div className="text-center py-12 text-gray-500">{UI_MESSAGES.LOADING.ALL_CLIENTS}</div>;
      if (!allClientsData?.data || allClientsData.data.length === 0) return <div className="text-center py-12 text-gray-500">{UI_MESSAGES.EMPTY.ALL_CLIENTS}</div>;
      return (
        <>
          <AllClientsTable clients={allClientsData.data} onViewDetails={handleViewDetails} />
          <PaginationControls
            currentPage={currentPage}
            paginationData={allClientsData.pagination}
            onPageChange={handlePageChange}
          />
        </>
      );
    }

    return <div className="text-center py-12 text-gray-500">{UI_MESSAGES.EMPTY.DEFAULT}</div>;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader user={user} onLogout={logout} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <StatsGrid stats={stats} />

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
          <div className="p-8">{renderTable()}</div>
        </div>
      </div>

      <FormValidationModal
        isOpen={formModalState.isOpen}
        onClose={handleFormModalClose}
        clientId={formModalState.clientId}
        formType={formModalState.formType}
        onSuccess={handleFormValidationSuccess}
      />
    </div>
  );
}
