
import React from 'react';
import { AppState, CustomerPricing, SaleType, SystemInfo } from '../types';
import { Save, Tag, DollarSign, Building, AlertTriangle, RefreshCcw, Info } from 'lucide-react';

interface SettingsProps {
  state: AppState;
  onUpdatePricing: (pricing: CustomerPricing) => void;
  onUpdateSystemInfo: (info: SystemInfo) => void;
  onApplyToAll: () => void;
}

const Settings: React.FC<SettingsProps> = ({ state, onUpdatePricing, onUpdateSystemInfo, onApplyToAll }) => {
  const [pricing, setPricing] = React.useState<CustomerPricing>(state.defaultPricing);
  const [sysInfo, setSysInfo] = React.useState<SystemInfo>(state.systemInfo);

  React.useEffect(() => {
    setPricing(state.defaultPricing);
  }, [state.defaultPricing]);

  React.useEffect(() => {
    setSysInfo(state.systemInfo);
  }, [state.systemInfo]);

  const handleSaveRates = () => {
    onUpdatePricing(pricing);
    alert('Global Default Prices updated successfully!');
  };

  const handleSaveSystemInfo = () => {
    onUpdateSystemInfo(sysInfo);
    alert('Company Profile updated successfully!');
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-12">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">System Configuration</h2>
        <p className="text-slate-500 dark:text-slate-400">Set the standard rates and company identity details used across the system.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pricing Config */}
        <section className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Tag className="text-blue-500" />
            Global Unit Rates
          </h3>
          
          <div className="space-y-6">
            {Object.values(SaleType).map((tier) => (
              <div key={tier}>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  {tier} Default Rate (BHD/Gallon)
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">BHD</div>
                  <input 
                    type="number"
                    step="0.001"
                    className="w-full pl-16 pr-4 py-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white font-mono font-black text-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={pricing[tier.toLowerCase() as keyof CustomerPricing]}
                    onChange={(e) => setPricing({...pricing, [tier.toLowerCase()]: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
            ))}

            <button
              onClick={handleSaveRates}
              className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Save size={20} />
              Update Unit Rates
            </button>
          </div>
        </section>

        {/* System Info Config */}
        <section className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Building className="text-indigo-500" />
                Company Profile (Receipt Info)
            </h3>
            
            <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Company Name</label>
                  <input 
                    className="w-full p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white font-bold text-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={sysInfo.companyName}
                    onChange={(e) => setSysInfo({...sysInfo, companyName: e.target.value})}
                    placeholder="e.g. SAFA WATER"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tagline / Business Type</label>
                  <input 
                    className="w-full p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={sysInfo.tagline}
                    onChange={(e) => setSysInfo({...sysInfo, tagline: e.target.value})}
                    placeholder="e.g. Premium Water Distribution"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Address / Branch Location</label>
                  <input 
                    className="w-full p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={sysInfo.address}
                    onChange={(e) => setSysInfo({...sysInfo, address: e.target.value})}
                    placeholder="e.g. Manama, Bahrain"
                  />
                </div>

                <button
                  onClick={handleSaveSystemInfo}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Save size={20} />
                  Update Company Profile
                </button>
            </div>
        </section>
      </div>

      <div className="max-w-xl">
        <section className="bg-amber-50 dark:bg-amber-900/10 p-8 rounded-[2rem] border border-amber-200 dark:border-amber-800/50 shadow-sm">
            <h3 className="text-lg font-bold text-amber-900 dark:text-amber-400 mb-4 flex items-center gap-2">
                <AlertTriangle className="text-amber-500" />
                Rate Sync Tool
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-500/80 mb-6 leading-relaxed">
                By default, unit rate changes only affect <b>New</b> customers. Click below to push your current global rates to <b>All</b> existing customer profiles. This is irreversible.
            </p>
            <button
                onClick={onApplyToAll}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-3 active:scale-95"
            >
                <RefreshCcw size={20} />
                Overwrite All Customer Pricing
            </button>
        </section>
      </div>
    </div>
  );
};

export default Settings;
