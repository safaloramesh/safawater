
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Settings from './components/Settings';
import Reports from './components/Reports';
import Login from './components/Login';
import { AppState, Customer, Pump, Sale, CustomerPricing, SaleType, User, Role, SystemInfo } from './types';
import { Plus, PlusCircle, UserPlus, Phone, User as UserIcon, Trash2, Droplet, Tag, DollarSign, Edit3, Check, X as CloseIcon, Wallet, ArrowUpCircle, History, ShieldCheck, UserCog, Key, Settings as SettingsIcon, Gauge, Truck, Layers, AlertTriangle } from 'lucide-react';

const INITIAL_STATE: AppState = {
  defaultPricing: {
    general: 0.100,
    small: 0.120,
    large: 0.080
  },
  systemInfo: {
    companyName: 'SAFA WATER',
    tagline: 'Premium Water Distribution',
    address: 'Bahrain Distribution Center'
  },
  users: [
    { id: 'U001', username: 'admin', password: 'J@sgroup@2@22', role: Role.ADMIN, createdAt: Date.now() },
    { id: 'U002', username: 'cashier', password: '1234', role: Role.OPERATOR, createdAt: Date.now() },
  ],
  customers: [
    { 
      id: 'C001', 
      name: 'General Market Store', 
      phone: '+973 3300 1122', 
      vehicleNo: '778844',
      defaultTier: SaleType.GENERAL,
      pricing: { general: 0.100, small: 0.120, large: 0.080 },
      isCredit: false,
      balance: 0,
      creditLimit: 0,
      createdAt: Date.now() 
    },
    { 
      id: 'C002', 
      name: 'Al-Hasan Solutions', 
      phone: '+973 3444 5566', 
      vehicleNo: '112233',
      defaultTier: SaleType.LARGE,
      pricing: { general: 0.090, small: 0.110, large: 0.070 },
      isCredit: true,
      balance: 25.500,
      creditLimit: 500,
      createdAt: Date.now() 
    },
  ],
  pumps: [
    { id: 1, name: 'Main Pump 1', currentReading: 1245.50, status: 'active' },
    { id: 2, name: 'Main Pump 2', currentReading: 3412.25, status: 'active' },
    { id: 3, name: 'Side Pump 3', currentReading: 890.10, status: 'active' },
    { id: 4, name: 'Bulk Pump 4', currentReading: 567.80, status: 'active' },
  ],
  sales: [],
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('safa_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('safa_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('safa_water_state_v18');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });

  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Customer | null>(null);
  
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserValues, setEditUserValues] = useState<User | null>(null);

  const [editingPumpId, setEditingPumpId] = useState<number | null>(null);
  const [tempPumpReading, setTempPumpReading] = useState<string>('');

  const [newCust, setNewCust] = useState({ 
    name: '', phone: '', vehicleNo: '', defaultTier: SaleType.GENERAL,
    pGeneral: state.defaultPricing.general, pSmall: state.defaultPricing.small, pLarge: state.defaultPricing.large,
    isCredit: false, creditLimit: 100
  });
  const [newUser, setNewUser] = useState({ username: '', password: '', role: Role.OPERATOR });

  useEffect(() => {
    localStorage.setItem('safa_water_state_v18', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem('safa_dark_mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    sessionStorage.setItem('safa_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('safa_user');
    setActiveTab('dashboard');
  };

  const handleAddSale = (newSale: Sale) => {
    setState(prev => {
      let updatedCustomers = prev.customers;
      if (newSale.paymentMethod === 'CREDIT') {
        updatedCustomers = prev.customers.map(c => 
          c.id === newSale.customerId ? { ...c, balance: c.balance + newSale.totalAmount } : c
        );
      }
      return { ...prev, sales: [newSale, ...prev.sales], customers: updatedCustomers };
    });
  };

  const handleUpdatePumpReading = (pumpId: number, newReading: number) => {
    setState(prev => ({
      ...prev,
      pumps: prev.pumps.map(p => p.id === pumpId ? { ...p, currentReading: newReading } : p)
    }));
  };

  const handlePaymentReceived = (customerId: string, amount: number) => {
    if (isNaN(amount) || amount <= 0) return;
    setState(prev => ({
      ...prev,
      customers: prev.customers.map(c => 
        c.id === customerId ? { ...c, balance: Math.max(0, c.balance - amount) } : c
      )
    }));
  };

  const toggleShowAddCustomer = () => {
    if (!showAddCustomer) {
      setNewCust({
        name: '', phone: '', vehicleNo: '', defaultTier: SaleType.GENERAL,
        pGeneral: state.defaultPricing.general, 
        pSmall: state.defaultPricing.small, 
        pLarge: state.defaultPricing.large,
        isCredit: false, creditLimit: 100
      });
    }
    setShowAddCustomer(!showAddCustomer);
  };

  const handleUpdatePricing = (pricing: CustomerPricing) => {
    setState(prev => ({
      ...prev,
      defaultPricing: pricing
    }));
  };

  const handleUpdateSystemInfo = (info: SystemInfo) => {
    setState(prev => ({
      ...prev,
      systemInfo: info
    }));
  };

  const handleApplyDefaultsToAll = () => {
    if (confirm("Sync current system rates to ALL customers? This overwrites individual pricing.")) {
      setState(prev => ({
        ...prev,
        customers: prev.customers.map(c => ({
          ...c,
          pricing: { ...prev.defaultPricing }
        }))
      }));
      alert("All customers are now using global standard rates.");
    }
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const customer: Customer = {
      id: `C${Math.floor(100 + Math.random() * 900)}`,
      name: newCust.name, phone: newCust.phone, vehicleNo: newCust.vehicleNo,
      defaultTier: newCust.defaultTier,
      pricing: { general: newCust.pGeneral, small: newCust.pSmall, large: newCust.pLarge },
      isCredit: newCust.isCredit, balance: 0, creditLimit: 1000, createdAt: Date.now()
    };
    setState(prev => ({ ...prev, customers: [...prev.customers, customer] }));
    setShowAddCustomer(false);
  };

  const handleUpdateCustomerSubmit = () => {
    if (editValues) {
      setState(prev => ({
        ...prev,
        customers: prev.customers.map(c => c.id === editValues.id ? editValues : c)
      }));
      setEditingCustomerId(null);
      setEditValues(null);
    }
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user: User = {
      id: `U${Math.floor(100 + Math.random() * 900)}`,
      username: newUser.username,
      password: newUser.password,
      role: newUser.role,
      createdAt: Date.now()
    };
    setState(prev => ({ ...prev, users: [...prev.users, user] }));
    setShowAddUser(false);
    setNewUser({ username: '', password: '', role: Role.OPERATOR });
  };

  const handleUpdateUserSubmit = () => {
    if (editUserValues) {
      setState(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === editUserValues.id ? editUserValues : u)
      }));
      setEditingUserId(null);
      setEditUserValues(null);
    }
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Permanently delete this user access?')) {
      setState(prev => ({
        ...prev,
        users: prev.users.filter(u => u.id !== id)
      }));
    }
  };

  const handleDeleteCustomer = (id: string) => {
    if (confirm('Permanently delete this customer profile? This action cannot be undone.')) {
      setState(prev => ({ 
        ...prev, 
        customers: prev.customers.filter(c => c.id !== id) 
      }));
    }
  };

  const savePumpAdjustment = (pumpId: number) => {
    const val = parseFloat(tempPumpReading);
    if (!isNaN(val)) {
      handleUpdatePumpReading(pumpId, val);
      setEditingPumpId(null);
    } else {
      alert("Please enter a valid numeric value.");
    }
  };

  const renderContent = () => {
    if (!currentUser) return null;

    switch (activeTab) {
      case 'dashboard': return <Dashboard state={state} />;
      case 'pos': return <POS state={state} onAddSale={handleAddSale} updatePumpReading={handleUpdatePumpReading} />;
      case 'reports': return <Reports state={state} />;
      case 'settings': return <Settings state={state} onUpdatePricing={handleUpdatePricing} onUpdateSystemInfo={handleUpdateSystemInfo} onApplyToAll={handleApplyDefaultsToAll} />;
      case 'customers': return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Customer Pricing</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Manage unique rates and vehicle assignments for your accounts.</p>
            </div>
            <button onClick={toggleShowAddCustomer} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg active:scale-95 transition-all"><PlusCircle size={18} />New Customer</button>
          </div>

          {showAddCustomer && (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border-2 border-blue-50 dark:border-slate-700 shadow-xl animate-in slide-in-from-top-4 mb-8">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Add New Customer</h3>
                <button onClick={() => setShowAddCustomer(false)} className="p-2 text-slate-400 hover:text-slate-600"><CloseIcon size={20} /></button>
              </div>
              <form onSubmit={handleAddCustomer} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Customer Name</label>
                     <input required className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 dark:text-white rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" value={newCust.name} onChange={e => setNewCust({...newCust, name: e.target.value})} placeholder="Full Business Name" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Phone</label>
                     <input required className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 dark:text-white rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" value={newCust.phone} onChange={e => setNewCust({...newCust, phone: e.target.value})} placeholder="+973 ..." />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Vehicle No.</label>
                     <input className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 dark:text-white rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" value={newCust.vehicleNo} onChange={e => setNewCust({...newCust, vehicleNo: e.target.value})} placeholder="323456" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Automatic Tier</label>
                     <select className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 dark:text-white rounded-2xl font-bold outline-none" value={newCust.defaultTier} onChange={e => setNewCust({...newCust, defaultTier: e.target.value as SaleType})}>
                        <option value={SaleType.GENERAL}>GENERAL</option>
                        <option value={SaleType.SMALL}>SMALL</option>
                        <option value={SaleType.LARGE}>LARGE</option>
                     </select>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">General Rate</label>
                     <input type="number" step="0.001" className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 dark:text-white rounded-2xl font-bold font-mono outline-none" value={newCust.pGeneral} onChange={e => setNewCust({...newCust, pGeneral: parseFloat(e.target.value)})} />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Small Rate</label>
                     <input type="number" step="0.001" className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 dark:text-white rounded-2xl font-bold font-mono outline-none" value={newCust.pSmall} onChange={e => setNewCust({...newCust, pSmall: parseFloat(e.target.value)})} />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Large Rate</label>
                     <input type="number" step="0.001" className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 dark:text-white rounded-2xl font-bold font-mono outline-none" value={newCust.pLarge} onChange={e => setNewCust({...newCust, pLarge: parseFloat(e.target.value)})} />
                   </div>
                   <div className="flex items-center gap-3 h-[60px] pl-2">
                      <input type="checkbox" id="isCreditNew" className="w-5 h-5 accent-blue-600" checked={newCust.isCredit} onChange={e => setNewCust({...newCust, isCredit: e.target.checked})} />
                      <label htmlFor="isCreditNew" className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase">Authorize Credit Sales</label>
                   </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-50 dark:border-slate-700/50">
                  <button type="submit" className="bg-slate-900 dark:bg-blue-600 text-white font-black px-10 py-4 rounded-2xl hover:bg-black dark:hover:bg-blue-700 transition-all">Add To Directory</button>
                  <button type="button" onClick={() => setShowAddCustomer(false)} className="px-6 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
            {state.customers.map(c => {
              const isEditing = editingCustomerId === c.id;
              return (
              <div key={c.id} className={`bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border ${isEditing ? 'border-blue-500 ring-4 ring-blue-50 dark:ring-blue-900/20 shadow-xl' : 'border-slate-200 dark:border-slate-700 shadow-sm'} transition-all`}>
                 {isEditing ? (
                   <div className="space-y-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-black text-blue-600 flex items-center gap-2"><Edit3 size={20} />Update Profile</h4>
                        <button onClick={() => setEditingCustomerId(null)} className="p-2 text-slate-400 hover:text-slate-100 dark:hover:bg-slate-700 rounded-full"><CloseIcon size={20} /></button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</label>
                          <input className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 dark:text-white rounded-xl font-bold" value={editValues?.name || ''} onChange={e => setEditValues(prev => prev ? ({...prev, name: e.target.value}) : null)} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</label>
                          <input className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 dark:text-white rounded-xl font-bold" value={editValues?.phone || ''} onChange={e => setEditValues(prev => prev ? ({...prev, phone: e.target.value}) : null)} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle No.</label>
                          <input className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 dark:text-white rounded-xl font-bold" value={editValues?.vehicleNo || ''} onChange={e => setEditValues(prev => prev ? ({...prev, vehicleNo: e.target.value}) : null)} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Automatic Tier</label>
                          <select className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 dark:text-white rounded-xl font-bold" value={editValues?.defaultTier} onChange={e => setEditValues(prev => prev ? ({...prev, defaultTier: e.target.value as SaleType}) : null)}>
                             <option value={SaleType.GENERAL}>GENERAL</option>
                             <option value={SaleType.SMALL}>SMALL</option>
                             <option value={SaleType.LARGE}>LARGE</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">General Rate</label>
                          <input type="number" step="0.001" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 dark:text-white rounded-xl font-bold font-mono" value={editValues?.pricing.general} onChange={e => setEditValues(prev => prev ? ({...prev, pricing: {...prev.pricing, general: parseFloat(e.target.value)}}) : null)} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Small Rate</label>
                          <input type="number" step="0.001" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 dark:text-white rounded-xl font-bold font-mono" value={editValues?.pricing.small} onChange={e => setEditValues(prev => prev ? ({...prev, pricing: {...prev.pricing, small: parseFloat(e.target.value)}}) : null)} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Large Rate</label>
                          <input type="number" step="0.001" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 dark:text-white rounded-xl font-bold font-mono" value={editValues?.pricing.large} onChange={e => setEditValues(prev => prev ? ({...prev, pricing: {...prev.pricing, large: parseFloat(e.target.value)}}) : null)} />
                        </div>
                      </div>

                      <button onClick={handleUpdateCustomerSubmit} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 shadow-xl flex items-center justify-center gap-2 transition-all"><Check size={20} />Save Changes</button>
                   </div>
                 ) : (
                   <div className="flex flex-col h-full relative">
                     <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-5 rounded-3xl ${c.isCredit ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'}`}>
                            {c.isCredit ? <Wallet size={28} /> : <UserIcon size={28} />}
                          </div>
                          <div className="flex-1">
                            <p className="font-black text-slate-900 dark:text-white text-xl leading-tight">{c.name}</p>
                            <div className="flex items-center gap-3 mt-1 text-slate-500 dark:text-slate-400">
                                <p className="text-sm font-bold">{c.phone}</p>
                                {c.vehicleNo && <span className="text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded tracking-widest">{c.vehicleNo}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => { setEditingCustomerId(c.id); setEditValues({...c}); }} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition-all"><Edit3 size={18} /></button>
                           <button onClick={(e) => { e.stopPropagation(); handleDeleteCustomer(c.id); }} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all" title="Delete Profile"><Trash2 size={20} /></button>
                        </div>
                     </div>
                     <div className="mt-8 grid grid-cols-3 gap-3">
                        {[
                          { label: 'General', val: c.pricing.general, color: 'text-indigo-600' },
                          { label: 'Small', val: c.pricing.small, color: 'text-emerald-600' },
                          { label: 'Large', val: c.pricing.large, color: 'text-rose-600' }
                        ].map((p, i) => (
                          <div key={i} className={`bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl text-center border ${c.defaultTier === p.label.toUpperCase() ? 'border-blue-500' : 'border-transparent'}`}>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{p.label}</p>
                            <p className={`text-xs font-black font-mono ${p.color}`}>{p.val.toFixed(3)}</p>
                          </div>
                        ))}
                     </div>
                   </div>
                 )}
              </div>
            )})}
          </div>
        </div>
      );
      case 'credit': return (
        <div className="space-y-8 animate-in fade-in duration-500">
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Credit Accounts</h2>
           <div className="grid grid-cols-1 gap-4">
              {state.customers.filter(c => c.isCredit).map(c => (
                <div key={c.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center gap-6 group hover:shadow-md transition-all">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-amber-600"><Wallet size={24}/></div>
                    <div><h4 className="font-black text-lg text-slate-900 dark:text-white">{c.name}</h4><p className="text-xs text-slate-400 font-bold">{c.phone}</p></div>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Balance Due</p>
                    <p className="text-xl font-black text-red-600 font-mono">{c.balance.toFixed(3)} BHD</p>
                  </div>
                  <button onClick={() => {
                    const amount = prompt(`Payment from ${c.name}:`);
                    if(amount) handlePaymentReceived(c.id, parseFloat(amount));
                  }} className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-700 transition-all active:scale-95">Record Payment</button>
                </div>
              ))}
           </div>
        </div>
      );
      case 'users': return (
        <div className="space-y-8 animate-in fade-in duration-500">
           <div className="flex justify-between items-end">
              <div><h2 className="text-3xl font-bold text-slate-900 dark:text-white">User Access</h2><p className="text-slate-500 dark:text-slate-400 mt-1">Manage personnel login credentials.</p></div>
              <button onClick={() => setShowAddUser(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg active:scale-95 transition-all"><Plus size={18} />Add User</button>
           </div>
           {showAddUser && (
             <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border-2 border-indigo-50 dark:border-slate-700 shadow-xl animate-in slide-in-from-top-4">
                <form onSubmit={handleAddUserSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label><input required className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded-2xl font-bold" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label><input required type="password" className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded-2xl font-bold" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label><select className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 rounded-2xl font-bold" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as Role})}><option value={Role.OPERATOR}>OPERATOR</option><option value={Role.ADMIN}>ADMIN</option></select></div>
                  <div className="flex gap-2"><button type="submit" className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-2xl transition-all hover:bg-indigo-700">Add User</button><button type="button" onClick={() => setShowAddUser(false)} className="px-6 border border-slate-200 rounded-2xl font-bold text-slate-500">Cancel</button></div>
                </form>
             </div>
           )}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
             {state.users.map(u => (
               <div key={u.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl"><ShieldCheck size={28} /></div>
                    <div><p className="font-black text-slate-900 dark:text-white text-lg leading-tight">{u.username}</p><p className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-widest">{u.role}</p></div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingUserId(u.id); setEditUserValues({...u}); }} className="p-2.5 text-slate-400 hover:text-indigo-600"><Edit3 size={18} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteUser(u.id); }} disabled={u.username === 'admin'} className="p-2.5 text-slate-400 hover:text-red-600 disabled:hidden"><Trash2 size={20} /></button>
                  </div>
               </div>
             ))}
           </div>
        </div>
      );
      case 'pumps': return (
        <div className="space-y-8 animate-in fade-in duration-500">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Pumps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {state.pumps.map(p => {
              const isEditing = editingPumpId === p.id;
              return (
              <div key={p.id} className="p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all text-center group">
                 <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6"><Droplet className="text-blue-600" size={32} /></div>
                 <h3 className="font-black text-xl text-slate-900 dark:text-white mb-2">{p.name}</h3>
                 <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-inner">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Meter Reading</p>
                    {isEditing ? (
                      <input 
                        type="number" 
                        step="0.01" 
                        className="w-full bg-white dark:bg-slate-950 border-2 border-blue-500 rounded-xl p-2 text-2xl font-black text-center text-slate-900 dark:text-white outline-none" 
                        value={tempPumpReading} 
                        onChange={(e) => setTempPumpReading(e.target.value)} 
                        autoFocus 
                        onKeyDown={(e) => e.key === 'Enter' && savePumpAdjustment(p.id)} 
                      />
                    ) : (
                      <p className="text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tighter">{p.currentReading.toFixed(2)}</p>
                    )}
                 </div>
                 {currentUser.role === Role.ADMIN && (
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                      {isEditing ? (
                        <div className="flex gap-2"><button onClick={() => savePumpAdjustment(p.id)} className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-2xl">SAVE</button><button onClick={() => setEditingPumpId(null)} className="flex-1 py-4 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-black rounded-2xl">X</button></div>
                      ) : (
                        <button onClick={() => { setEditingPumpId(p.id); setTempPumpReading(p.currentReading.toString()); }} className="w-full py-4 bg-slate-900 dark:bg-slate-700 text-white font-black rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">ADJUST METER</button>
                      )}
                    </div>
                 )}
              </div>
            )})}
          </div>
        </div>
      );
      default: return <Dashboard state={state} />;
    }
  };

  if (!currentUser) return <Login users={state.users} onLogin={handleLogin} />;

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} onLogout={handleLogout} darkMode={darkMode} setDarkMode={setDarkMode}>
      {renderContent()}
    </Layout>
  );
};

export default App;
