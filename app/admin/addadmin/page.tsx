'use client';

import { useAdminAuthStore } from '@/lib/stores/admin-auth.store';
import { useAddAdminForm } from '@/lib/admin/hooks/useAddAdminForm';
import { usePermissionCheck } from '@/lib/admin/hooks/usePermissionCheck';
import AddAdminHeader from '@/components/admin/addadmin/AddAdminHeader';
import LoadingState from '@/components/admin/addadmin/LoadingState';
import SuccessAlert from '@/components/admin/addadmin/SuccessAlert';
import FormField from '@/components/admin/addadmin/FormField';
import RoleSelect from '@/components/admin/addadmin/RoleSelect';
import FormActions from '@/components/admin/addadmin/FormActions';
import SecurityNotice from '@/components/admin/addadmin/SecurityNotice';

export default function AddAdminPage() {
  const user = useAdminAuthStore((state) => state.user);
  const isAuthenticated = useAdminAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAdminAuthStore((state) => state._hasHydrated);

  const { hasAccess } = usePermissionCheck(
    hasHydrated ? isAuthenticated : false,
    hasHydrated ? (user ?? null) : null
  );

  const { form, isPending, isSuccess, onSubmit } = useAddAdminForm();
  const { register, handleSubmit, formState: { errors, isValid } } = form;

  if (!hasHydrated || !isAuthenticated) return null;

  if (!hasAccess) {
    return <LoadingState isAuthenticated={isAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AddAdminHeader user={user ?? null} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {isSuccess && <div className="mb-6"><SuccessAlert /></div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <FormField
              id="username"
              label="Username"
              type="text"
              register={register}
              errors={errors}
              disabled={isPending || isSuccess}
              placeholder="e.g. john_admin"
              autoComplete="off"
            />
            <FormField
              id="email"
              label="Email"
              type="email"
              register={register}
              errors={errors}
              disabled={isPending || isSuccess}
              placeholder="admin@example.com"
              autoComplete="email"
            />
            <FormField
              id="password"
              label="Password"
              type="password"
              register={register}
              errors={errors}
              disabled={isPending || isSuccess}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
            />
            <FormField
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              register={register}
              errors={errors}
              disabled={isPending || isSuccess}
              placeholder="Repeat password"
              autoComplete="new-password"
            />
            <RoleSelect register={register} errors={errors} disabled={isPending || isSuccess} />
            <SecurityNotice />
            <FormActions isPending={isPending} isSuccess={isSuccess} isValid={isValid} />
          </form>
        </div>
      </main>
    </div>
  );
}
