import { useTranslation } from 'react-i18next';
import { Languages, Info, Shield, Bell, Globe } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const SettingSection = ({ title, children, icon: Icon }: { title: string, children: React.ReactNode, icon: LucideIcon }) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm shadow-xl flex flex-col gap-6">
    <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
      <div className="p-2 rounded-xl bg-slate-800 text-brand-400">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
    </div>
    {children}
  </div>
);

export const Settings = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'ja' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-white tracking-tight">{t('common.settings')}</h1>
        <p className="text-slate-400">Customize your experience and manage application preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <SettingSection title="Language & Appearance" icon={Languages}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-200 font-semibold">Language</div>
                <div className="text-slate-500 text-sm">Select your preferred interface language</div>
              </div>
              <button 
                onClick={toggleLanguage}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-white transition-all font-medium"
              >
                {i18n.language === 'en' ? '日本語 に切替' : 'Switch to English'}
              </button>
            </div>
            <div className="h-px bg-slate-800" />
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-200 font-semibold">Theme</div>
                <div className="text-slate-500 text-sm">Dark mode is currently enforced</div>
              </div>
              <div className="px-4 py-1.5 bg-brand-500/20 text-brand-400 rounded-full text-xs font-bold uppercase tracking-widest">
                Dark Only
              </div>
            </div>
          </div>
        </SettingSection>

        <SettingSection title="System Information" icon={Info}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Version</span>
              <span className="text-slate-200 font-mono">1.1.0-stable</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Backend API</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Database</span>
              <span className="text-slate-200">PostgreSQL + pgvector</span>
            </div>
            <div className="h-px bg-slate-800" />
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-all text-sm font-bold"
            >
              <Globe className="w-4 h-4" />
              View Source on GitHub
            </a>
          </div>
        </SettingSection>

        <SettingSection title="Notifications" icon={Bell}>
          <p className="text-slate-500 text-sm italic">Notification settings are coming soon.</p>
        </SettingSection>

        <SettingSection title="Security & Compliance" icon={Shield}>
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <div className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-1">Notice</div>
              <div className="text-slate-300 text-sm leading-relaxed">
                This instance is running with default system administrator privileges.
              </div>
            </div>
          </div>
        </SettingSection>
      </div>
    </div>
  );
};
