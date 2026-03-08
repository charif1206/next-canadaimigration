'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already-verified' | 'awaiting-verification'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // User just registered — show "check your email" message
    if (searchParams.get('registered') === 'true') {
      setStatus('awaiting-verification');
      setMessage('Please check your email for the verification link');
      return;
    }

    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    const verifyEmail = async () => {
      try {
        // Frontend API route: GET /api/auth/verify-email/[token]
        const response = await axios.get(`/api/auth/verify-email/${token}`);

        if (response.data.alreadyVerified) {
          setStatus('already-verified');
          setMessage('Email already verified');
        } else {
          setStatus('success');
          setMessage('Email verified successfully!');
          toast.success('✅ Email verified! You can now log in.');
        }
      } catch (error: unknown) {
        setStatus('error');
        const axiosError = error as { response?: { data?: { message?: string } } };
        const errorMessage =
          axiosError.response?.data?.message || 'Verification failed. The link may have expired.';
        setMessage(errorMessage);
        toast.error(errorMessage);
      }
    };

    verifyEmail();
  }, [searchParams]);

  // ── Awaiting verification ──────────────────────────────────────────────────
  if (status === 'awaiting-verification') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-600 to-purple-900 py-12 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">📧 Check Your Email</h1>
          <p className="text-gray-600 mb-6">
            We&apos;ve sent a verification link to your email address. Please check your inbox (and spam folder) and click the link to activate your admin account.
          </p>
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6 text-left">
            <p className="text-sm text-purple-800">
              <strong>Didn&apos;t receive the email?</strong>
              <br />• Check your spam/junk folder
              <br />• Make sure you entered the correct email address
              <br />• Wait a few minutes and refresh your inbox
              <br />• The verification link is valid for 24 hours
            </p>
          </div>
          <Link
            href="/admin/login"
            className="w-full inline-block bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            Go to Login Page
          </Link>
        </div>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-600 to-purple-900">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center animate-pulse mb-6">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2..." />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Verifying your email...</h2>
          <p className="text-gray-500 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (status === 'success' || status === 'already-verified') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-600 to-purple-900 py-12 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {status === 'already-verified' ? 'Already Verified ✅' : 'Email Verified! ✅'}
          </h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <Link
            href="/admin/login"
            className="w-full inline-block bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition"
            onClick={() => router.push('/admin/login')}
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-600 to-purple-900 py-12 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Verification Failed ❌</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <Link
          href="/admin/login"
          className="w-full inline-block bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function AdminVerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
