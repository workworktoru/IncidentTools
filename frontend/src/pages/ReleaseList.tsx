import { useQuery } from '@tanstack/react-query';
import { releaseApi } from '../api/api';
import { MoreHorizontal, Ship } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const StatusBadge = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  const styles: Record<string, string> = {
    'Planned': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Building': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'Testing': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Deployed': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Closed': 'bg-slate-700/10 text-slate-500 border-slate-700/20',
  };
  return (
    <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-semibold border", styles[status] || styles['Planned'])}>
      {t(`releases.status.${status}`)}
    </span>
  );
};

export const ReleaseList = () => {
  const { data: releases = [], isLoading } = useQuery({ queryKey: ['releases'], queryFn: releaseApi.list });
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('releases.list_title')}</h1>
          <p className="text-slate-400 mt-1">{t('releases.list_subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/releases/new')}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl text-sm font-medium hover:bg-brand-600 transition-colors"
          >
            {t('releases.new_release')}
          </button>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-800/20">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('releases.table_version')}</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('common.status')}</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('releases.table_actual_date')}</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">{t('common.action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={4} className="px-6 py-4 bg-slate-800/10 h-16"></td>
                </tr>
              ))
            ) : releases.map((release) => (
              <tr key={release.id} className="hover:bg-slate-800/20 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                      <Ship className="w-4 h-4 text-brand-400" />
                    </div>
                    <div className="font-bold text-slate-200 group-hover:text-brand-400 transition-colors">v{release.version}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={release.status} />
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  {release.actual_date ? new Date(release.actual_date).toLocaleDateString() : 'Pending'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => navigate(`/releases/${release.id}`)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && releases.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                  {t('releases.no_releases_found')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
