import { useQuery } from '@tanstack/react-query';
import { changeApi } from '../api/api';
import { MoreHorizontal } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const StatusBadge = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  const styles: Record<string, string> = {
    'Requested': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Planning': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Approved': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Implementing': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'Completed': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    'Closed': 'bg-slate-700/10 text-slate-500 border-slate-700/20',
    'Canceled': 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-semibold border", styles[status] || styles['Requested'])}>
      {t(`changes.status.${status}`)}
    </span>
  );
};

export const ChangeList = () => {
  const { data: changes = [], isLoading } = useQuery({ queryKey: ['changes'], queryFn: changeApi.list });
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('changes.list_title')}</h1>
          <p className="text-slate-400 mt-1">{t('changes.list_subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/changes/new')}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl text-sm font-medium hover:bg-brand-600 transition-colors"
          >
            {t('changes.new_change')}
          </button>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-800/20">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('common.id_title')}</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('changes.table_type')}</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('common.status')}</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('changes.table_scheduled_date')}</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">{t('common.action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-6 py-4 bg-slate-800/10 h-16"></td>
                </tr>
              ))
            ) : changes.map((change) => (
              <tr key={change.id} className="hover:bg-slate-800/20 transition-colors group">
                <td className="px-6 py-4">
                  <div className="text-xs font-mono text-slate-500 mb-1">#{change.id.slice(0, 8)}</div>
                  <div className="font-medium text-slate-200 group-hover:text-brand-400 transition-colors">{change.title}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-300">
                  {t(`changes.type.${change.change_type}`)}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={change.status} />
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  {change.scheduled_date ? new Date(change.scheduled_date).toLocaleString() : 'Not set'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => navigate(`/changes/${change.id}`)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && changes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                  {t('changes.no_changes_found')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
