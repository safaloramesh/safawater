
import React, { useState } from 'react';
import { AppState, Sale, PaymentMethod, SaleType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Users, Droplets, CreditCard, Tag, FileText, Printer, X, Download } from 'lucide-react';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const [showXReport, setShowXReport] = useState(false);

  // Today's Sales Calculation
  const today = new Date().toDateString();
  const todaySales = state.sales.filter(s => new Date(s.timestamp).toDateString() === today);
  
  const totalSales = state.sales.reduce((acc, sale) => acc + sale.totalAmount, 0);
  const totalLiters = state.sales.reduce((acc, sale) => acc + sale.quantity, 0);
  const totalCustomers = state.customers.length;

  // X-Report Summary Calculations
  const xReportData = {
    totalRevenue: todaySales.reduce((acc, s) => acc + s.totalAmount, 0),
    totalVolume: todaySales.reduce((acc, s) => acc + s.quantity, 0),
    transactionCount: todaySales.length,
    cashTotal: todaySales.filter(s => s.paymentMethod === 'CASH').reduce((acc, s) => acc + s.totalAmount, 0),
    creditTotal: todaySales.filter(s => s.paymentMethod === 'CREDIT').reduce((acc, s) => acc + s.totalAmount, 0),
    tiers: {
      general: todaySales.filter(s => s.saleType === SaleType.GENERAL).reduce((acc, s) => acc + s.totalAmount, 0),
      small: todaySales.filter(s => s.saleType === SaleType.SMALL).reduce((acc, s) => acc + s.totalAmount, 0),
      large: todaySales.filter(s => s.saleType === SaleType.LARGE).reduce((acc, s) => acc + s.totalAmount, 0),
    },
    pumps: state.pumps.map(p => ({
      id: p.id,
      name: p.name,
      volume: todaySales.filter(s => s.pumpId === p.id).reduce((acc, s) => acc + s.quantity, 0),
      revenue: todaySales.filter(s => s.pumpId === p.id).reduce((acc, s) => acc + s.totalAmount, 0),
    }))
  };

  const pumpStats = state.pumps.map(p => ({
    name: p.name,
    total: state.sales.filter(s => s.pumpId === p.id).reduce((acc, s) => acc + s.quantity, 0)
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome, {state.systemInfo.companyName} Team</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time distribution analytics and performance summary.</p>
        </div>
        <div className="flex items-center gap-3 no-print">
          <button 
            onClick={() => setShowXReport(true)}
            className="bg-slate-900 dark:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-black dark:hover:bg-blue-700 transition-all shadow-lg active:scale-95"
          >
            <FileText size={18} />
            Daily X-Report
          </button>
          <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-tight">System Online</span>
          </div>
        </div>
      </header>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Today\'s Revenue', value: `${xReportData.totalRevenue.toFixed(3)} BHD`, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Today\'s Volume', value: `${xReportData.totalVolume.toFixed(2)} G`, icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'All Customers', value: totalCustomers, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
          { label: 'Total Revenue', value: `${totalSales.toFixed(3)} BHD`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</h3>
              </div>
              <div className={`${stat.bg} p-3 rounded-xl`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" />
            Pump Distribution History (Liters)
          </h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pumpStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff'}}
                  cursor={{fill: '#f8fafc', opacity: 0.05}}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                  {pumpStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm h-full">
           <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
             <Tag size={20} className="text-indigo-500" />
             Standard Unit Prices
           </h3>
           <div className="space-y-4">
              {[
                { label: 'General Tier', val: state.defaultPricing.general, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
                { label: 'Small Tier', val: state.defaultPricing.small, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
                { label: 'Large Tier', val: state.defaultPricing.large, color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20' }
              ].map((tier, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-slate-100 dark:border-slate-700 flex justify-between items-center group hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400">{tier.label}</p>
                  <div className={`px-4 py-2 rounded-xl font-mono font-black ${tier.color}`}>
                    {tier.val.toFixed(3)} BHD
                  </div>
                </div>
              ))}
           </div>
           <p className="mt-8 text-[11px] font-bold text-slate-400 uppercase text-center leading-relaxed">
             Global defaults used for walk-ins. <br/>Individual customer rates may vary.
           </p>
        </div>
      </div>

      {/* X-Report Modal */}
      {showXReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <style>{`
            @media print {
              @page {
                margin: 0;
                size: 80mm auto;
              }
              body {
                margin: 0;
                padding: 0;
                background: white !important;
              }
              .no-print {
                display: none !important;
              }
              .print-area {
                display: block !important;
                width: 80mm;
                padding: 5mm;
                margin: 0;
                font-family: 'Courier New', Courier, monospace;
                color: black !important;
                background: white !important;
              }
              .thermal-divider {
                border-top: 1px dashed black;
                margin: 3mm 0;
              }
              .thermal-bold {
                font-weight: 900;
              }
              .thermal-center {
                text-align: center;
              }
              .thermal-right {
                text-align: right;
              }
              .thermal-large {
                font-size: 1.2rem;
                line-height: 1.2;
              }
              .thermal-small {
                font-size: 0.75rem;
              }
            }
          `}</style>
          
          <div className="modal-content bg-white dark:bg-slate-900 w-full max-w-[420px] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b dark:border-slate-800 no-print">
              <div className="flex items-center gap-3">
                <FileText className="text-blue-600" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">X-Report Preview</h3>
              </div>
              <button onClick={() => setShowXReport(false)} className="p-2 text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-100 dark:bg-slate-950 flex justify-center custom-scrollbar">
              <div id="x-report-body" className="print-area bg-white text-black p-5 w-[80mm] shadow-lg">
                <div className="thermal-center">
                  <h1 className="thermal-bold thermal-large uppercase">{state.systemInfo.companyName}</h1>
                  <p className="thermal-bold thermal-small mt-1">DAILY X-REPORT (SUMMARY)</p>
                  <div className="thermal-divider"></div>
                </div>

                <div className="thermal-small leading-loose">
                  <div className="flex justify-between"><span>DATE:</span><span>{new Date().toLocaleDateString()}</span></div>
                  <div className="flex justify-between"><span>TIME:</span><span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
                </div>

                <div className="thermal-divider"></div>

                <div className="thermal-small leading-tight space-y-2">
                  <p className="thermal-bold uppercase mb-1">Financials:</p>
                  <div className="flex justify-between"><span>CASH SALES:</span><span className="thermal-bold">{xReportData.cashTotal.toFixed(3)} BHD</span></div>
                  <div className="flex justify-between"><span>CREDIT SALES:</span><span className="thermal-bold">{xReportData.creditTotal.toFixed(3)} BHD</span></div>
                  <div className="flex justify-between thermal-bold border-t border-black pt-1">
                    <span>NET REVENUE:</span>
                    <span>{xReportData.totalRevenue.toFixed(3)} BHD</span>
                  </div>
                </div>

                <div className="thermal-divider"></div>

                <div className="thermal-small leading-tight space-y-2">
                  <p className="thermal-bold uppercase mb-1">Operations:</p>
                  <div className="flex justify-between"><span>TOTAL VOLUME:</span><span className="thermal-bold">{xReportData.totalVolume.toFixed(2)} G</span></div>
                  <div className="flex justify-between"><span>TOTAL TXNS:</span><span className="thermal-bold">{xReportData.transactionCount}</span></div>
                </div>

                <div className="thermal-divider"></div>

                <div className="thermal-small leading-tight">
                  <p className="thermal-bold uppercase mb-2">Pump Breakdown:</p>
                  <div className="space-y-3">
                    {xReportData.pumps.map(p => (
                      <div key={p.id} className="pl-2 border-l-2 border-black">
                        <div className="flex justify-between thermal-bold">
                          <span>PUMP #0{p.id}</span>
                          <span>{p.revenue.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between text-[10px] opacity-70">
                          <span>Volume Sold:</span>
                          <span>{p.volume.toFixed(2)} G</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="thermal-divider"></div>

                <div className="thermal-center mt-6">
                  <p className="thermal-small italic opacity-70">End of Shift Verification</p>
                  <div className="mt-8 flex justify-between px-2">
                    <div className="text-center w-24">
                      <div className="border-t border-black pt-1 thermal-small">Cashier</div>
                    </div>
                    <div className="text-center w-24">
                      <div className="border-t border-black pt-1 thermal-small">Manager</div>
                    </div>
                  </div>
                </div>
                
                <div className="h-12"></div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800 flex gap-4 no-print border-t dark:border-slate-700">
              <button 
                onClick={() => window.print()}
                className="flex-1 bg-slate-900 dark:bg-blue-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-black dark:hover:bg-blue-700 active:scale-95 transition-all shadow-xl"
              >
                <Printer size={20} /> PRINT X-REPORT
              </button>
              <button 
                onClick={() => setShowXReport(false)}
                className="flex-1 bg-white dark:bg-slate-700 border-2 dark:border-slate-600 text-slate-900 dark:text-white font-black py-4 rounded-2xl"
              >
                DONE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
