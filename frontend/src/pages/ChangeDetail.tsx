import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { changeApi } from '../api/api';
import { ArrowLeft, LoaderCircle, Save, Clock, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

import type { Change } from '../types';

export const ChangeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [status, setStatus] = useState<string | null>(null);

  const { data: change, isLoading } = useQuery({
    queryKey: ['change', id],
    queryFn: () => changeApi.get(id!),
    enabled: !!id,
  });

  const currentStatus = status ?? change?.status ?? '';

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Change>) => changeApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changes'] });
      queryClient.invalidateQueries({ queryKey: ['change', id] });
      toast.success(t('changes.update_success'));
      setStatus(null);
    },
    onError: () => {
      toast.error('Failed to update change');
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoaderCircle className="w-10 h-10 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!change) return <div className="text-white">Change not found</div>;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/changes')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('common.back_to_list')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm shadow-xl">
            <div className="text-xs font-mono text-slate-500 mb-2">#{change.id}</div>
            <div className="flex items-center gap-3 mb-4">
               <span className="px-3 py-1 bg-brand-500/20 text-brand-400 rounded-full text-xs font-bold uppercase tracking-wider">
                 {t(`changes.type.${change.change_type}`)}
               </span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-6">{change.title}</h1>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">{t('changes.form_impact_analysis')}</h3>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-300 whitespace-pre-wrap">
                  {change.impact_analysis || "No impact analysis documented."}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">{t('changes.form_backout_plan')}</h3>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-300 whitespace-pre-wrap">
                  {change.backout_plan || "No backout plan documented."}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-400" />
              {t('changes.lifecycle')}
            </h3>
            <div className="space-y-6">
               <div className="flex gap-4">
                <div className="w-px bg-slate-800 relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-brand-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-200">{t('changes.requested')}</div>
                  <div className="text-xs text-slate-500 mt-1">{new Date(change.requested_at).toLocaleString()}</div>
                </div>
              </div>
              
              {change.scheduled_date && (
                <div className="flex gap-4">
                  <div className="w-px bg-slate-800 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      {t('changes.scheduled_deployment')}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{new Date(change.scheduled_date).toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">{t('changes.status_management')}</h3>
            <div className="flex flex-col gap-4">
              <label htmlFor="change-status-select" className="sr-only">{t('changes.status_management')}</label>
              <select 
                id="change-status-select"
                value={currentStatus}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-brand-500 transition-all appearance-none cursor-pointer text-slate-200"
              >
                {['Requested', 'Planning', 'Approved', 'Implementing', 'Completed', 'Closed', 'Canceled'].map(s => (
                  <option key={s} value={s}>{t(`changes.status.${s}`)}</option>
                ))}
              </select>
              <button 
                disabled={currentStatus === change.status || updateMutation.isPending}
                onClick={() => updateMutation.mutate({ status: currentStatus })}
                className="flex items-center justify-center gap-2 w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all disabled:opacity-50"
              >
                {updateMutation.isPending ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t('changes.update_status')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
