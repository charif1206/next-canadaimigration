'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import adminApi from '@/lib/admin/api/axios.config';
import type { FormType } from '@/lib/admin/constants/dashboard.constants';

interface FormValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  formType: FormType;
  onSuccess: () => void;
}

interface FormData {
  client: {
    id: string;
    name: string;
    email: string;
    passportNumber?: string;
    nationality?: string;
  };
  status: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  submission: Record<string, unknown> | null;
}

export default function FormValidationModal({
  isOpen,
  onClose,
  clientId,
  formType,
  onSuccess,
}: FormValidationModalProps) {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen && clientId) {
      fetchFormData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, clientId, formType]);

  const fetchFormData = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.get<FormData>(
        `/api/clients/${clientId}/forms/${formType}`
      );
      setFormData(response.data);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to fetch form data');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidate = async () => {
    setIsProcessing(true);
    try {
      await adminApi.post('/api/clients/validate', {
        clientId,
        formType,
        action: 'validated',
      });
      toast.success(`✅ ${getFormTitle()} validated successfully!`);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to validate form');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setIsProcessing(true);
    try {
      await adminApi.post('/api/clients/validate', {
        clientId,
        formType,
        action: 'rejected',
        reason: rejectionReason,
      });
      toast.success(`❌ ${getFormTitle()} rejected`);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to reject form');
    } finally {
      setIsProcessing(false);
    }
  };

  const getFormTitle = () => {
    switch (formType) {
      case 'equivalence':
        return 'Equivalence Form';
      case 'residence':
        return 'Residence Form';
      case 'partner':
        return 'Partner Application';
    }
  };

  const renderFormData = () => {
    if (!formData?.submission) {
      return <p className="text-gray-500">No submission data available</p>;
    }

    const data = formData.submission as Record<string, string | undefined>;

    if (formType === 'equivalence') {
      return (
        <div className="grid grid-cols-1 text-black md:grid-cols-2 gap-4">
          <FieldDisplay label="First Name" value={data.prenom} />
          <FieldDisplay label="Last Name" value={data.nom} />
          <FieldDisplay label="Email" value={data.email} />
          <FieldDisplay label="Phone" value={data.telephone} />
          <FieldDisplay label="Address" value={data.adresse} />
          <FieldDisplay label="Postal Code" value={data.codePostal} />
          <FieldDisplay label="Education Level" value={data.niveau} />
          <FieldDisplay label="University" value={data.universite} />
        </div>
      );
    }

    if (formType === 'residence') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldDisplay label="Full Name" value={data.nomComplet} />
          <FieldDisplay label="Date of Birth" value={data.dateNaissance} />
          <FieldDisplay label="Country" value={data.paysResidence} />
          <FieldDisplay label="Program" value={data.programme} />
          <FieldDisplay label="Application Number" value={data.numeroDossier} />
          <FieldDisplay label="Stage" value={data.etape} />
        </div>
      );
    }

    if (formType === 'partner') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldDisplay label="Agency Name" value={data.agencyName} />
          <FieldDisplay label="Manager Name" value={data.managerName} />
          <FieldDisplay label="Email" value={data.email} />
          <FieldDisplay label="Phone" value={data.phone} />
          <div className="md:col-span-2">
            <FieldDisplay label="Message" value={data.message} />
          </div>
        </div>
      );
    }

    return null;
  };

  if (!isOpen) return null;

  const docUrl =
    (formData?.submission as Record<string, string | undefined>)?.portfolioUrl ||
    (formData?.submission as Record<string, string | undefined>)?.fileUrl;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-linear-to-r from-purple-600 to-purple-800 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {formType === 'equivalence' && '🎓 '}
              {formType === 'residence' && '🧩 '}
              {formType === 'partner' && '🤝 '}
              {getFormTitle()}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
              disabled={isProcessing}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading form data...</p>
            </div>
          ) : formData ? (
            <>
              {/* Client Information */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Client Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FieldDisplay label="Name" value={formData.client.name} />
                  <FieldDisplay label="Email" value={formData.client.email} />
                  {formData.client.passportNumber && (
                    <FieldDisplay label="Passport" value={formData.client.passportNumber} />
                  )}
                  {formData.client.nationality && (
                    <FieldDisplay label="Nationality" value={formData.client.nationality} />
                  )}
                </div>

                {/* Current Status */}
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-gray-500">Current Status</p>
                  <p className="font-semibold">
                    {formData.status === 'pending' && (
                      <span className="text-yellow-600">⏳ Pending</span>
                    )}
                    {formData.status === 'validated' && (
                      <span className="text-green-600">✅ Validated</span>
                    )}
                    {formData.status === 'rejected' && (
                      <span className="text-red-600">❌ Rejected</span>
                    )}
                    {!formData.status && (
                      <span className="text-gray-500">—</span>
                    )}
                  </p>
                  {formData.rejectionReason && (
                    <p className="mt-2 text-sm text-red-500">
                      Rejection Reason: {formData.rejectionReason}
                    </p>
                  )}
                </div>
              </div>

              {/* Form Submission Data */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Submission Data</h3>
                <div className="p-4 bg-gray-50 rounded-lg">{renderFormData()}</div>
              </div>

              {/* Document Link */}
              {docUrl && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">📁 Uploaded Documents</h3>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-10 h-10 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">
                          {formType === 'equivalence' ? 'Portfolio Document' : 'Residence Document'}
                        </p>
                        <a
                          href={docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                          Open Document
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Rejection Reason Input */}
              <div className="mb-6">
                <label
                  htmlFor="rejectionReason"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Rejection Reason (required when rejecting)
                </label>
                <textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason if rejecting..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  disabled={isProcessing}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:bg-red-300"
                  disabled={isProcessing}
                >
                  {isProcessing ? '⏳ Rejecting...' : '❌ Reject'}
                </button>
                <button
                  onClick={handleValidate}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-green-300"
                  disabled={isProcessing}
                >
                  {isProcessing ? '⏳ Validating...' : '✅ Validate'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">No form data available</div>
          )}
        </div>
      </div>
    </div>
  );
}

function FieldDisplay({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-semibold text-gray-800">{value || 'N/A'}</p>
    </div>
  );
}
