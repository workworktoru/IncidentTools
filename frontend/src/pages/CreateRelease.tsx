import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { releaseApi, userApi } from '../api/api';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

import type { Release } from '../types';

export const CreateRelease = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    version: '',
    release_note: '',
    status: 'Planned',
    actual_date: ''
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const testUserId = "00000000-0000-0000-0000-000000000000";
      
      // Ensure user exists
      try {
        await userApi.create({
          id: testUserId,
          username: "release_manager",
          email: "release@example.com",
          is_admin: true
        });
      } catch {
        console.log("User might already exist, continuing...");
      }

      const payload: Partial<Release> = {
        version: data.version,
        release_note: data.release_note || "",
        status: data.status || "Planned",
        managed_by_id: testUserId,
        actual_date: (data.actual_date && data.actual_date.trim() !== "") ? new Date(data.actual_date).toISOString() : undefined
      };

      return releaseApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      toast.success(t('releases.update_success'));
      navigate('/releases');
    },
    onError: (error: Error) => {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      const msg = axiosError.response?.data?.detail || error.message;
      toast.error(`Failed to plan release: ${msg}`);
      console.error("Release creation error:", error);
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
        <h1 className="text-3xl font-bold text-white tracking-tight">{t('releases.create_title')}</h1>
        <p className="text-slate-400 mt-2">{t('releases.create_subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm flex flex-col gap-6 shadow-2xl">
        <div className="flex flex-col gap-2">
          <label htmlFor="release-version" className="text-sm font-semibold text-slate-400 ml-1">{t('releases.form_version')}</label>
          <input 
            required
            id="release-version"
            type="text" 
            value={formData.version}
            onChange={e => setFormData({...formData, version: e.target.value})}
            placeholder={t('releases.form_version_placeholder')}
            className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-lg text-white"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="release-note" className="text-sm font-semibold text-slate-400 ml-1">{t('releases.form_release_note')}</label>
          <textarea 
            rows={4}
            id="release-note"
            value={formData.release_note}
            onChange={e => setFormData({...formData, release_note: e.target.value})}
            placeholder={t('releases.form_release_note_placeholder')}
            className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-none text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="release-status" className="text-sm font-semibold text-slate-400 ml-1">{t('releases.form_status')}</label>
            <select 
              id="release-status"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
              className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-brand-500 transition-all appearance-none cursor-pointer text-white"
            >
              <option value="Planned">{t('releases.status.Planned')}</option>
              <option value="Building">{t('releases.status.Building')}</option>
              <option value="Testing">{t('releases.status.Testing')}</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="release-date" className="text-sm font-semibold text-slate-400 ml-1">{t('releases.form_date')}</label>
            <input 
              id="release-date"
              type="date" 
              value={formData.actual_date}
              onChange={e => setFormData({...formData, actual_date: e.target.value})}
              className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-brand-500 transition-all text-white"
            />
          </div>
        </div>

        <button 
          disabled={loading}
          type="submit"
          className="mt-4 flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <LoaderCircle className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {t('releases.form_submit')}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
