'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuthStore } from '@/lib/stores/admin-auth.store';
import { useFormById } from '@/lib/admin/hooks/useForms';
import { usePartnerById } from '@/lib/admin/hooks/usePartners';
import { useClientById } from '@/lib/admin/hooks/useClients';

const formatDate = (date: string | null | undefined) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

function StatusBadge({ status }: { status: string | undefined | null }) {
  if (!status) return <span className="text-gray-500">—</span>;
  const colors: Record<string, string> = {
    validated: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };
  const icons: Record<string, string> = {
    validated: '✅',
    rejected: '❌',
    pending: '⏳',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status] ?? 'bg-gray-100 text-gray-800'}`}>
      {icons[status] ?? ''} {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function DetailsPageContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type'); // 'form', 'partner', or 'client'
  const id = searchParams.get('id');

  const { data: formData, isLoading: formLoading } = useFormById(type === 'form' && id ? id : '');
  const { data: partnerData, isLoading: partnerLoading } = usePartnerById(type === 'partner' && id ? id : '');
  const { data: clientData, isLoading: clientLoading } = useClientById(type === 'client' && id ? id : '');

  const isLoading =
    type === 'form' ? formLoading : type === 'partner' ? partnerLoading : clientLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!id || !type) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Invalid URL — missing type or id</h2>
          <Link href="/admin" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const hasData =
    (type === 'form' && formData) ||
    (type === 'partner' && partnerData) ||
    (type === 'client' && clientData);

  if (!hasData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Data not found</h2>
          <Link href="/admin" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-linear-to-r from-purple-600 to-purple-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {type === 'form' && '📋 Form Details'}
              {type === 'partner' && '🤝 Partner Details'}
              {type === 'client' && '👤 Client Profile'}
            </h1>
            <p className="text-purple-100">Viewing detailed information</p>
          </div>
          <Link
            href="/admin"
            className="bg-white text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* FORM DETAILS */}
        {type === 'form' && formData && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="border-b pb-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {formData.type === 'EQUIVALENCE' ? 'Equivalence Form' : 'Residence Form'}
              </h2>
              <p className="text-gray-600">Submitted on {formatDate(formData.createdAt)}</p>
            </div>

            {formData.client && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-purple-100 text-purple-600 rounded-full p-2">👤</span>
                  Client Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-lg">
                  <div><p className="text-sm text-gray-500">Name</p><p className="font-semibold text-gray-800">{formData.client.name}</p></div>
                  <div><p className="text-sm text-gray-500">Email</p><p className="font-semibold text-gray-800">{formData.client.email}</p></div>
                  <div>
                    <p className="text-sm text-gray-500">Email Verified</p>
                    <p className="font-semibold">
                      {formData.client.isEmailVerified
                        ? <span className="text-green-600">✅ Verified</span>
                        : <span className="text-yellow-600">⏳ Not Verified</span>}
                    </p>
                  </div>
                  <div><p className="text-sm text-gray-500">Member Since</p><p className="font-semibold text-gray-800">{formatDate(formData.client.createdAt)}</p></div>
                </div>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 rounded-full p-2">📝</span>
                Form Data
              </h3>
              <div className="bg-gray-50 p-6 rounded-lg">
                {formData.type === 'EQUIVALENCE' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      ['First Name', 'prenom'], ['Last Name', 'nom'], ['Email', 'email'],
                      ['Phone', 'telephone'], ['Address', 'adresse'], ['Postal Code', 'codePostal'],
                      ['Education Level', 'niveau'], ['University', 'universite'],
                      ['Bachelor Degree', 'titreLicence'], ['Master Degree', 'titreMaster'],
                      ['Start Year', 'anneeDebut'], ['Bachelor Grad. Year', 'anneeObtentionLicence'],
                      ['Master Grad. Year', 'anneeObtentionMaster'],
                    ].map(([label, key]) =>
                      formData.data[key] ? (
                        <div key={key}>
                          <p className="text-sm text-gray-500">{label}</p>
                          <p className="font-semibold text-gray-800">{String(formData.data[key])}</p>
                        </div>
                      ) : null
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      ['Full Name', 'nomComplet'], ['Date of Birth', 'dateNaissance'],
                      ['Country', 'paysResidence'], ['Program', 'programme'],
                      ['Application Number', 'numeroDossier'], ['Stage', 'etape'],
                    ].map(([label, key]) =>
                      formData.data[key] ? (
                        <div key={key}>
                          <p className="text-sm text-gray-500">{label}</p>
                          <p className="font-semibold text-gray-800">{String(formData.data[key])}</p>
                        </div>
                      ) : null
                    )}
                  </div>
                )}

                {formData.fileUrl && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-2">Attached File</p>
                    <a
                      href={formData.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                    >
                      📎 View Attached File
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PARTNER DETAILS */}
        {type === 'partner' && partnerData && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="border-b pb-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Partner Application</h2>
              <p className="text-gray-600">Submitted on {formatDate(partnerData.createdAt)}</p>
            </div>
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="bg-green-100 text-green-600 rounded-full p-2">🤝</span>
                Agency Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-lg">
                <div><p className="text-sm text-gray-500">Agency Name</p><p className="font-semibold text-gray-800">{partnerData.data.agencyName}</p></div>
                <div><p className="text-sm text-gray-500">Manager Name</p><p className="font-semibold text-gray-800">{partnerData.data.managerName}</p></div>
                <div><p className="text-sm text-gray-500">Email</p><p className="font-semibold text-gray-800">{partnerData.data.email}</p></div>
                <div><p className="text-sm text-gray-500">Phone / WhatsApp</p><p className="font-semibold text-gray-800">{partnerData.data.phone}</p></div>
                {partnerData.data.address && <div><p className="text-sm text-gray-500">Address</p><p className="font-semibold text-gray-800">{partnerData.data.address}</p></div>}
                {partnerData.data.city && <div><p className="text-sm text-gray-500">City / Wilaya</p><p className="font-semibold text-gray-800">{partnerData.data.city}</p></div>}
                {partnerData.data.clientCount && <div><p className="text-sm text-gray-500">Monthly Client Count</p><p className="font-semibold text-gray-800">{partnerData.data.clientCount} clients</p></div>}
              </div>
              {partnerData.data.message && (
                <div className="mt-6 bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm text-gray-500 mb-2">Message</p>
                  <p className="text-gray-800">{partnerData.data.message}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CLIENT DETAILS */}
        {type === 'client' && clientData && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="border-b pb-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Client Profile</h2>
              <p className="text-gray-600">Member since {formatDate(clientData.createdAt)}</p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-600 rounded-full p-2">👤</span>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-lg">
                <div><p className="text-sm text-gray-500">Full Name</p><p className="font-semibold text-gray-800">{clientData.name}</p></div>
                <div><p className="text-sm text-gray-500">Email</p><p className="font-semibold text-gray-800">{clientData.email}</p></div>
                <div>
                  <p className="text-sm text-gray-500">Email Verified</p>
                  <p className="font-semibold">
                    {clientData.isEmailVerified
                      ? <span className="text-green-600">✅ Verified</span>
                      : <span className="text-yellow-600">⏳ Not Verified</span>}
                  </p>
                </div>
                <div><p className="text-sm text-gray-500">Last Updated</p><p className="font-semibold text-gray-800">{formatDate(clientData.updatedAt)}</p></div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 rounded-full p-2">📝</span>
                Form Submissions
              </h3>
              <div className="space-y-4">
                {clientData.isSendingPartners && (
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">🤝 Partner Application</p>
                        <p className="text-sm text-gray-600">Status: {clientData.partnerStatus ?? 'unknown'}</p>
                      </div>
                      <StatusBadge status={clientData.partnerStatus} />
                    </div>
                    {clientData.partnerRejectionReason && (
                      <p className="text-sm text-red-600 mt-2">Rejection Reason: {clientData.partnerRejectionReason}</p>
                    )}
                  </div>
                )}

                {clientData.isSendingFormulaireResidence && (
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">🏠 Residence Application</p>
                        <p className="text-sm text-gray-600">Status: {clientData.residenceStatus ?? 'unknown'}</p>
                      </div>
                      <StatusBadge status={clientData.residenceStatus} />
                    </div>
                    {clientData.residenceRejectionReason && (
                      <p className="text-sm text-red-600 mt-2">Rejection Reason: {clientData.residenceRejectionReason}</p>
                    )}
                  </div>
                )}

                {clientData.isSendingFormulaireEquivalence && (
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">🎓 Equivalence Application</p>
                        <p className="text-sm text-gray-600">Status: {clientData.equivalenceStatus ?? 'unknown'}</p>
                      </div>
                      <StatusBadge status={clientData.equivalenceStatus} />
                    </div>
                    {clientData.equivalenceRejectionReason && (
                      <p className="text-sm text-red-600 mt-2">Rejection Reason: {clientData.equivalenceRejectionReason}</p>
                    )}
                  </div>
                )}

                {!clientData.isSendingPartners &&
                  !clientData.isSendingFormulaireResidence &&
                  !clientData.isSendingFormulaireEquivalence && (
                    <div className="text-center py-4 text-gray-500">No form submissions yet</div>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDetailsPage() {
  const router = useRouter();
  const isAuthenticated = useAdminAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAdminAuthStore((state) => state._hasHydrated);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated || !isAuthenticated) return null;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600" />
        </div>
      }
    >
      <DetailsPageContent />
    </Suspense>
  );
}
