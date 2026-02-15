
import React from 'react';
import { 
  LayoutDashboard, 
  Droplets, 
  Users, 
  PlusCircle,
  TrendingUp,
  Tag,
  CreditCard,
  // Fixed: Removed non-existent Lucide member 'UserGear'
  LogOut,
  ShieldCheck,
  // Fixed: Removed unused 'User' import
  Moon,
  Sun
} from 'lucide-react';
import { Role, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, currentUser, onLogout, darkMode, setDarkMode }) => {
  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [Role.ADMIN, Role.OPERATOR] },
    { id: 'pos', label: 'New Sale (POS)', icon: PlusCircle, roles: [Role.ADMIN, Role.OPERATOR] },
    { id: 'pumps', label: 'Pump Management', icon: Droplets, roles: [Role.ADMIN, Role.OPERATOR] },
    { id: 'customers', label: 'Customer Pricing', icon: Users, roles: [Role.ADMIN] },
    { id: 'credit', label: 'Credit Customers', icon: CreditCard, roles: [Role.ADMIN] },
    { id: 'settings', label: 'Default Tiers', icon: Tag, roles: [Role.ADMIN] },
    { id: 'users', label: 'User Access', icon: ShieldCheck, roles: [Role.ADMIN] },
    { id: 'reports', label: 'Reports', icon: TrendingUp, roles: [Role.ADMIN] },
  ];

  const navItems = allNavItems.filter(item => 
    currentUser && item.roles.includes(currentUser.role)
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col no-print">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">SAFA WATER</h1>
          </div>
          <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest font-semibold">Bahrain Distribution</p>
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 space-y-2 border-t border-slate-800">
          {/* Dark Mode Toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <div className="flex items-center gap-3">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              <span className="text-sm font-medium">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
          </button>

          <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-blue-400">
                {currentUser?.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 truncate">Logged in as</p>
                <p className="text-sm font-semibold text-white truncate">{currentUser?.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
               <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${
                 currentUser?.role === Role.ADMIN ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'
               }`}>
                 {currentUser?.role}
               </span>
               <button 
                onClick={onLogout}
                className="ml-auto p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                title="Logout"
               >
                 <LogOut size={16} />
               </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
