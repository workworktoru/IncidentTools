import { useQuery } from '@tanstack/react-query';
import { problemApi } from '../api/api';
import { MoreHorizontal } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const StatusBadge = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  const styles: Record<string, string> = {
    'Open': 'bg-red-500/10 text-red-400 border-red-500/20',
    'Identified': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Resolved': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Closed': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };
  return (
    <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-semibold border", styles[status] || styles['Open'])}>
      {t(`problems.status.${status}`)}
    </span>
  );
};

export const ProblemList = () => {
  const { data: problems = [], isLoading } = useQuery({ queryKey: ['problems'], queryFn: problemApi.list });
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('problems.list_title')}</h1>
          <p className="text-slate-400 mt-1">{t('problems.list_subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/problems/new')}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl text-sm font-medium hover:bg-brand-600 transition-colors"
          >
            {t('problems.new_problem')}
          </button>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-800/20">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('common.id_title')}</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('common.status')}</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('problems.table_identified_at')}</th>
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
            ) : problems.map((problem) => (
              <tr key={problem.id} className="hover:bg-slate-800/20 transition-colors group">
                <td className="px-6 py-4">
                  <div className="text-xs font-mono text-slate-500 mb-1">#{problem.id.slice(0, 8)}</div>
                  <div className="font-medium text-slate-200 group-hover:text-brand-400 transition-colors">{problem.title}</div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={problem.status} />
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  {new Date(problem.identified_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => navigate(`/problems/${problem.id}`)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && problems.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                  {t('problems.no_problems_found')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
