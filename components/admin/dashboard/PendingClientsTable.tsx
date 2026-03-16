import type { Client } from '@/lib/admin/types/client.types';
import type { FormType } from '@/lib/admin/constants/dashboard.constants';
import { ACTION_BUTTONS } from '@/lib/admin/constants/dashboard.constants';
import { formatDate } from '@/lib/admin/utils/date.utils';

interface PendingClientsTableProps {
  clients: Client[];
  headerColor: string;
  onViewData: (clientId: string, formType: FormType) => void;
  onValidate: (clientId: string, formType: FormType) => void;
  formType: FormType;
}

export default function PendingClientsTable({
  clients,
  headerColor,
  onViewData,
  onValidate,
  formType,
}: PendingClientsTableProps) {
  return (
    <div className="overflow-x-auto text-black">
      <table className="w-full">
        <thead>
          <tr className={`${headerColor} text-white`}>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Submitted Date</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id} className="border-b hover:bg-gray-50 transition-colors">
              <td className="px-4 py-4 font-medium">{client.name}</td>
              <td className="px-4 py-4">{client.email}</td>

              <td className="px-4 py-4">{formatDate(client.createdAt)}</td>
              <td className="px-4 py-4">
                <div className="flex gap-2">
                  <button
                    className={ACTION_BUTTONS.VIEW_DATA.className}
                    onClick={() => onViewData(client.id, formType)}
                  >
                    {ACTION_BUTTONS.VIEW_DATA.label}
                  </button>
                  <button
                    className={ACTION_BUTTONS.VALIDATE.className}
                    onClick={() => onValidate(client.id, formType)}
                  >
                    {ACTION_BUTTONS.VALIDATE.label}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
