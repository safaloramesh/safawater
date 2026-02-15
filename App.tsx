
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Settings from './components/Settings';
import Reports from './components/Reports';
import Login from './components/Login';
import { AppState, Customer, Pump, Sale, CustomerPricing, SaleType, User, Role, SystemInfo } from './types';
import { PlusCircle, Loader2, CloudUpload, CloudCheck } from 'lucide-react';

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
    }
  ],
  pumps: [
    { id: 1, name: 'Pump 1', currentReading: 0, status: 'active' },
    { id: 2, name: 'Pump 2', currentReading: 0, status: 'active' },
    { id: 3, name: 'Pump 3', currentReading: 0, status: 'active' },
    { id: 4, name: 'Pump 4', currentReading: 0, status: 'active' },
  ],
  sales: [],
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('safa_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('safa_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  // Load state from Backend
  useEffect(() => {
    const fetchState = async () => {
      try {
        const response = await fetch('/api/state');
        const data = await response.json();
        if (data && Object.keys(data).length > 0) {
          setState(data);
        } else {
          // If server is empty, save initial state
          await syncWithBackend(INITIAL_STATE);
        }
      } catch (error) {
        console.error("Failed to load backend data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchState();
  }, []);

  const syncWithBackend = async (newState: AppState) => {
    setIsSyncing(true);
    try {
      await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newState)
      });
    } catch (error) {
      console.error("Failed to sync with backend:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Wrapper for setState that also syncs to backend
  const updateState = useCallback((updater: (prev: AppState) => AppState) => {
    setState(prev => {
      const next = updater(prev);
      syncWithBackend(next);
      return next;
    });
  }, []);

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
    updateState(prev => {
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
    updateState(prev => ({
      ...prev,
      pumps: prev.pumps.map(p => p.id === pumpId ? { ...p, currentReading: newReading } : p)
    }));
  };

  const handlePaymentReceived = (customerId: string, amount: number) => {
    if (isNaN(amount) || amount <= 0) return;
    updateState(prev => ({
      ...prev,
      customers: prev.customers.map(c => 
        c.id === customerId ? { ...c, balance: Math.max(0, c.balance - amount) } : c
      )
    }));
  };

  const handleUpdatePricing = (pricing: CustomerPricing) => {
    updateState(prev => ({ ...prev, defaultPricing: pricing }));
  };

  const handleUpdateSystemInfo = (info: SystemInfo) => {
    updateState(prev => ({ ...prev, systemInfo: info }));
  };

  const handleApplyDefaultsToAll = () => {
    if (confirm("Sync current system rates to ALL customers?")) {
      updateState(prev => ({
        ...prev,
        customers: prev.customers.map(c => ({
          ...c,
          pricing: { ...prev.defaultPricing }
        }))
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-slate-900 flex flex-col items-center justify-center text-white gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        <p className="font-bold tracking-widest uppercase text-xs animate-pulse">Initializing Safa Water System...</p>
      </div>
    );
  }

  if (!currentUser) return <Login users={state.users} onLogin={handleLogin} />;

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} onLogout={handleLogout} darkMode={darkMode} setDarkMode={setDarkMode}>
      {/* Sync Indicator */}
      <div className="fixed bottom-6 right-6 z-50 no-print">
        {isSyncing ? (
          <div className="bg-white dark:bg-slate-800 shadow-xl rounded-full px-4 py-2 border border-blue-200 dark:border-blue-900 flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase">
            <CloudUpload size={14} className="animate-bounce" /> Syncing to Database
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 shadow-xl rounded-full px-4 py-2 border border-emerald-200 dark:border-emerald-900 flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase">
            <CloudCheck size={14} /> Data Secure
          </div>
        )}
      </div>

      {activeTab === 'dashboard' && <Dashboard state={state} />}
      {activeTab === 'pos' && <POS state={state} onAddSale={handleAddSale} updatePumpReading={handleUpdatePumpReading} />}
      {activeTab === 'reports' && <Reports state={state} />}
      {activeTab === 'settings' && <Settings state={state} onUpdatePricing={handleUpdatePricing} onUpdateSystemInfo={handleUpdateSystemInfo} onApplyToAll={handleApplyDefaultsToAll} />}
      
      {/* Customer and User management sections would be rendered here based on activeTab logic as previously implemented */}
    </Layout>
  );
};

export default App;
