import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { problemApi } from '../api/api';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

import type { Problem } from '../types';

export const CreateProblem = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    root_cause: '',
    workaround: '',
    status: 'Open'
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<Problem>) => problemApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      toast.success(t('problems.update_success'));
      navigate('/problems');
    },
    onError: (error: Error) => {
      console.error(error);
      toast.error('Failed to create problem');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await mutation.mutateAsync(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">{t('problems.create_title')}</h1>
        <p className="text-slate-400 mt-2">{t('problems.create_subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm flex flex-col gap-6 shadow-2xl">
        <div className="flex flex-col gap-2">
          <label htmlFor="problem-title" className="text-sm font-semibold text-slate-400 ml-1">{t('problems.form_title')}</label>
          <input 
            required
            id="problem-title"
            type="text" 
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            placeholder={t('problems.form_title_placeholder')}
            className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-lg text-white"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="problem-root-cause" className="text-sm font-semibold text-slate-400 ml-1">{t('problems.form_root_cause')}</label>
          <textarea 
            rows={4}
            id="problem-root-cause"
            value={formData.root_cause}
            onChange={e => setFormData({...formData, root_cause: e.target.value})}
            placeholder={t('problems.form_root_cause_placeholder')}
            className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-none text-white"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="problem-workaround" className="text-sm font-semibold text-slate-400 ml-1">{t('problems.form_workaround')}</label>
          <textarea 
            rows={3}
            id="problem-workaround"
            value={formData.workaround}
            onChange={e => setFormData({...formData, workaround: e.target.value})}
            placeholder={t('problems.form_workaround_placeholder')}
            className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-none text-white"
          />
        </div>

        <button 
          disabled={loading}
          type="submit"
          className="mt-4 flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <LoaderCircle className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {t('problems.form_submit')}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
