import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ciApi } from '../api/api';
import { ArrowLeft, LoaderCircle, Save, Database, Trash2, Clock, MapPin, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import type { ConfigurationItem } from '../types';

export const CIDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [status, setStatus] = useState<string | null>(null);

  const { data: item, isLoading } = useQuery({
    queryKey: ['configuration-item', id],
    queryFn: () => ciApi.get(id!),
    enabled: !!id,
  });

  const currentStatus = status ?? item?.status ?? '';

  const updateMutation = useMutation({
    mutationFn: (data: Partial<ConfigurationItem>) => ciApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuration-items'] });
      queryClient.invalidateQueries({ queryKey: ['configuration-item', id] });
      toast.success('CI updated successfully');
      setStatus(null);
    },
    onError: () => {
      toast.error('Failed to update CI');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => ciApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuration-items'] });
      toast.success('CI deleted successfully');
      navigate('/inventory');
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoaderCircle className="w-10 h-10 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!item) return <div className="text-white">Configuration Item not found</div>;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/inventory')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('common.back_to_list')}
        </button>
        <button 
          onClick={() => {
            if(window.confirm('Are you sure you want to delete this CI?')) {
              deleteMutation.mutate();
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-500/20"
        >
          <Trash2 className="w-4 h-4" />
          Delete CI
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-400">
                <Database className="w-8 h-8" />
              </div>
              <div>
                <div className="text-xs font-mono text-slate-500">#{item.id.slice(0, 8)}</div>
                <h1 className="text-3xl font-bold text-white">{item.name}</h1>
              </div>
            </div>
            
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              {item.description || "No description provided for this configuration item."}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Type
                </div>
                <div className="text-slate-200">{t(`inventory.type.${item.type}`)}</div>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Environment
                </div>
                <div className="text-slate-200">{item.environment || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-400" />
              History
            </h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-px bg-slate-800 relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-brand-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-200">Asset Registered</div>
                  <div className="text-xs text-slate-500 mt-1">{new Date(item.created_at).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Status Management</h3>
            <div className="flex flex-col gap-4">
              <select 
                value={currentStatus}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-brand-500 transition-all appearance-none cursor-pointer text-slate-200"
              >
                {['Active', 'Maintenance', 'Retired'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button 
                disabled={currentStatus === item.status || updateMutation.isPending}
                onClick={() => updateMutation.mutate({ status: currentStatus })}
                className="flex items-center justify-center gap-2 w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all disabled:opacity-50"
              >
                {updateMutation.isPending ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Update Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
