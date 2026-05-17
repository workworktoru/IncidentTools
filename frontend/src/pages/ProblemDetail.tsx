import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { problemApi } from '../api/api';
import { ArrowLeft, LoaderCircle, Save, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

import type { Problem } from '../types';

export const ProblemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [status, setStatus] = useState<string | null>(null);

  const { data: problem, isLoading } = useQuery({
    queryKey: ['problem', id],
    queryFn: () => problemApi.get(id!),
    enabled: !!id,
  });

  const currentStatus = status ?? problem?.status ?? '';

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Problem>) => problemApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      queryClient.invalidateQueries({ queryKey: ['problem', id] });
      toast.success(t('problems.update_success'));
      setStatus(null);
    },
    onError: () => {
      toast.error('Failed to update problem');
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoaderCircle className="w-10 h-10 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!problem) return <div className="text-white">Problem not found</div>;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/problems')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('common.back_to_list')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm shadow-xl">
            <div className="text-xs font-mono text-slate-500 mb-2">#{problem.id}</div>
            <h1 className="text-3xl font-bold text-white mb-6">{problem.title}</h1>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">{t('problems.form_root_cause')}</h3>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-300 whitespace-pre-wrap">
                  {problem.root_cause || "No root cause documented yet."}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">{t('problems.form_workaround')}</h3>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-300 whitespace-pre-wrap">
                  {problem.workaround || "No workaround documented yet."}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-400" />
              {t('problems.timeline')}
            </h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-px bg-slate-800 relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-200">{t('problems.problem_identified')}</div>
                  <div className="text-xs text-slate-500 mt-1">{new Date(problem.identified_at).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">{t('problems.status_management')}</h3>
            <div className="flex flex-col gap-4">
              <label htmlFor="problem-status-select" className="sr-only">{t('problems.status_management')}</label>
              <select 
                id="problem-status-select"
                value={currentStatus}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-brand-500 transition-all appearance-none cursor-pointer text-slate-200"
              >
                {['Open', 'Identified', 'Resolved', 'Closed'].map(s => (
                  <option key={s} value={s}>{t(`problems.status.${s}`)}</option>
                ))}
              </select>
              <button 
                disabled={currentStatus === problem.status || updateMutation.isPending}
                onClick={() => updateMutation.mutate({ status: currentStatus })}
                className="flex items-center justify-center gap-2 w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all disabled:opacity-50"
              >
                {updateMutation.isPending ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t('problems.update_status')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
