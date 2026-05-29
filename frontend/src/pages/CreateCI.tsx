import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ciApi } from '../api/api';
import { ArrowLeft, LoaderCircle, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import type { ConfigurationItem } from '../types';

export const CreateCI = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Server',
    status: 'Active',
    environment: 'Production'
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<ConfigurationItem>) => ciApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuration-items'] });
      toast.success('Configuration item created successfully');
      navigate('/inventory');
    },
    onError: (error: Error) => {
      toast.error('Failed to create configuration item');
      console.error(error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/inventory')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('common.cancel')}
        </button>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">{t('inventory.new_ci')}</h1>
        <p className="text-slate-400 mt-2">{t('inventory.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm flex flex-col gap-6 shadow-2xl">
        <div className="flex flex-col gap-2">
          <label htmlFor="ci-name" className="text-sm font-semibold text-slate-400 ml-1">{t('inventory.table_name')}</label>
          <input 
            required
            id="ci-name"
            type="text" 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-lg text-white"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="ci-description" className="text-sm font-semibold text-slate-400 ml-1">Description</label>
          <textarea 
            rows={3}
            id="ci-description"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-none text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="ci-type" className="text-sm font-semibold text-slate-400 ml-1">{t('inventory.table_type')}</label>
            <select 
              id="ci-type"
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
              className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-brand-500 transition-all appearance-none cursor-pointer text-white"
            >
              {['Server', 'Database', 'Application', 'Network', 'Cloud Service', 'Other'].map(type => (
                <option key={type} value={type}>{t(`inventory.type.${type}`)}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="ci-environment" className="text-sm font-semibold text-slate-400 ml-1">{t('inventory.table_environment')}</label>
            <select 
              id="ci-environment"
              value={formData.environment}
              onChange={e => setFormData({...formData, environment: e.target.value})}
              className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-brand-500 transition-all appearance-none cursor-pointer text-white"
            >
              <option value="Production">Production</option>
              <option value="Staging">Staging</option>
              <option value="Development">Development</option>
              <option value="Testing">Testing</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="ci-status" className="text-sm font-semibold text-slate-400 ml-1">{t('inventory.table_status')}</label>
            <select 
              id="ci-status"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
              className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-brand-500 transition-all appearance-none cursor-pointer text-white"
            >
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
        </div>

        <button 
          disabled={mutation.isPending}
          type="submit"
          className="mt-4 flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {mutation.isPending ? (
            <LoaderCircle className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              Create CI
            </>
          )}
        </button>
      </form>
    </div>
  );
};
