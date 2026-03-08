'use client';

import { useAllClients, usePendingClients, useValidatedClients } from './useClients';
import {
  filterPendingPartnerClients,
  filterPendingResidenceClients,
  filterPendingEquivalenceClients,
} from '../utils/clientFilter.utils';
import { createVerificationEntries } from '../utils/verification.utils';

export function useDashboardFilters(currentPage: number) {
  const { data: allClientsData, isLoading: loadingAll } = useAllClients(currentPage);
  const {
    data: pendingClients,
    isLoading: loadingPending,
    refetch: refetchPending,
  } = usePendingClients();
  const { data: validatedClients, isLoading: loadingValidated } = useValidatedClients();

  const pendingPartnerClients = filterPendingPartnerClients(pendingClients);
  const pendingResidenceClients = filterPendingResidenceClients(pendingClients);
  const pendingEquivalenceClients = filterPendingEquivalenceClients(pendingClients);

  const verificationEntries = createVerificationEntries(validatedClients);

  const stats = {
    totalClients: allClientsData?.pagination.total ?? 0,
    pendingPartner: pendingPartnerClients.length,
    pendingResidence: pendingResidenceClients.length,
    pendingEquivalence: pendingEquivalenceClients.length,
    validatedClients: validatedClients?.length ?? 0,
  };

  return {
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
  };
}
