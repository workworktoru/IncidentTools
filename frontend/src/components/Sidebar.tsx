import { LayoutDashboard, AlertCircle, Database, PlusCircle, Settings, Search, ShieldAlert, GitPullRequest, Ship } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

const SidebarItem = ({ to, icon: Icon, label, active }: { to: string, icon: LucideIcon, label: string, active: boolean }) => (
  <Link
    to={to}
    className={clsx(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-brand-500/10 text-brand-400 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]" 
        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
    )}
  >
    <Icon className={clsx("w-5 h-5 transition-transform duration-200", active ? "scale-110" : "group-hover:scale-110")} />
    <span className="font-medium">{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />}
  </Link>
);

export const Sidebar = () => {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <div className="w-72 h-screen sticky top-0 bg-slate-950/40 backdrop-blur-xl border-r border-slate-800/50 p-6 flex flex-col gap-8">
      <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
          <AlertCircle className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          AI Incident
        </span>
      </div>

      <nav className="flex flex-col gap-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="text-xs font-semibold text-slate-500 px-4 mb-2 uppercase tracking-wider">{t('common.main')}</div>
        <SidebarItem to="/" icon={LayoutDashboard} label={t('common.dashboard')} active={location.pathname === "/"} />
        <SidebarItem to="/incidents" icon={AlertCircle} label={t('common.incidents')} active={location.pathname === "/incidents"} />
        <SidebarItem to="/problems" icon={ShieldAlert} label={t('common.problems')} active={location.pathname === "/problems"} />
        <SidebarItem to="/changes" icon={GitPullRequest} label={t('common.changes')} active={location.pathname === "/changes"} />
        <SidebarItem to="/releases" icon={Ship} label={t('common.releases')} active={location.pathname === "/releases"} />
        <SidebarItem to="/inventory" icon={Database} label={t('common.inventory')} active={location.pathname === "/inventory"} />
        
        <div className="text-xs font-semibold text-slate-500 px-4 mt-6 mb-2 uppercase tracking-wider">{t('common.actions')}</div>
        <SidebarItem to="/incidents/new" icon={PlusCircle} label={t('common.report_issue')} active={location.pathname === "/incidents/new"} />
        <SidebarItem to="/search" icon={Search} label={t('common.ai_search')} active={location.pathname === "/search"} />
      </nav>

      <div className="mt-auto">
        <SidebarItem to="/settings" icon={Settings} label={t('common.settings')} active={location.pathname === "/settings"} />
      </div>
    </div>
  );
};
