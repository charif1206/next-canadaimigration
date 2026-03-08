'use client';

import { useState } from 'react';
import type { TabType, FormType } from '../constants/dashboard.constants';
import { PAGINATION_CONFIG } from '../constants/dashboard.constants';

interface FormModalState {
  isOpen: boolean;
  clientId: string;
  formType: FormType;
}

export function useDashboardState() {
  const [activeTab, setActiveTab] = useState<TabType>('pending-partner');
  const [currentPage, setCurrentPage] = useState<number>(
    PAGINATION_CONFIG.DEFAULT_PAGE,
  );
  const [formModalState, setFormModalState] = useState<FormModalState>({
    isOpen: false,
    clientId: '',
    formType: 'equivalence',
  });

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'all-clients') {
      setCurrentPage(1);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleFormModalOpen = (clientId: string, formType: FormType) => {
    setFormModalState({ isOpen: true, clientId, formType });
  };

  const handleFormModalClose = () => {
    setFormModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return {
    activeTab,
    currentPage,
    formModalState,
    handleTabChange,
    handlePageChange,
    handleFormModalOpen,
    handleFormModalClose,
  };
}
