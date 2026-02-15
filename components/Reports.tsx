
import React, { useState } from 'react';
import { AppState, Sale } from '../types';
import { FileText, Download, Filter, Search, Printer, FileSpreadsheet, File as FileIcon, Calendar } from 'lucide-react';

interface ReportsProps {
  state: AppState;
}

type TimeRange = 'all' | 'today' | 'month' | 'year';

const Reports: React.FC<ReportsProps> = ({ state }) => {
  const [filterType, setFilterType] = useState<'all' | 'pump' | 'customer'>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [filterVal, setFilterVal] = useState('');

  const filteredSales = state.sales.filter(sale => {
    // Search/ID Filter
    const matchesFilter = () => {
      if (filterType === 'pump') return sale.pumpId.toString() === filterVal || filterVal === '';
      if (filterType === 'customer') return sale.customerName.toLowerCase().includes(filterVal.toLowerCase());
      return true;
    };

    // Time Range Filter
    const matchesTime = () => {
      const saleDate = new Date(sale.timestamp);
      const now = new Date();

      switch (timeRange) {
        case 'today':
          return saleDate.toDateString() === now.toDateString();
        case 'month':
          return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
        case 'year':
          return saleDate.getFullYear() === now.getFullYear();
        case 'all':
        default:
          return true;
      }
    };

    return matchesFilter() && matchesTime();
  }).sort((a, b) => b.timestamp - a.timestamp);

  const handleExportExcel = () => {
    const headers = ["Transaction ID", "Date", "Time", "Customer", "Pump", "Quantity (L)", "Amount (BHD)", "Method"];
    const rows = filteredSales.map(s => {
      const dt = new Date(s.timestamp);
      return [
        s.id,
        dt.toLocaleDateString(),
        dt.toLocaleTimeString(),
        `"${s.customerName.replace(/"/g, '""')}"`,
        s.pumpId,
        s.quantity.toFixed(2),
        s.totalAmount.toFixed(3),
        s.paymentMethod
      ];
    });
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${state.systemInfo.companyName.replace(/\s+/g, '_')}_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500">
      <style>{`
        @media print {
          @page { 
            size: A4 landscape; 
            margin: 15mm 10mm; 
          }
          html, body {
            height: auto !important;
            overflow: visible !important;
            background: white !important;
          }
          aside, nav, header, .no-print, button {
            display: none !important;
          }
          main, div#root, .flex {
            display: block !important;
            height: auto !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          #report-print-area {
            display: block !important;
            border: none !important;
            box-shadow: none !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          thead { display: table-header-group !important; }
          tfoot { display: table-footer-group !important; }
          th, td {
            border: 1px solid #e2e8f0 !important;
            padding: 8px 12px !important;
            color: black !important;
            font-size: 10pt !important;
          }
          th { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; }
          .print-header {
            display: block !important;
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #334155;
          }
          .print-header h1 { font-size: 28pt; font-weight: 800; margin: 0; color: #1e293b; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 no-print">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Activity Reports</h2>
          <p className="text-slate-500 dark:text-slate-400">View and analyze your water sales data across pumps and tiers.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handlePrintPDF}
            className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            <Printer size={18} />
            Export PDF
          </button>
          <button 
            onClick={handleExportExcel}
            className="bg-slate-900 dark:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-lg dark:shadow-none"
          >
            <FileSpreadsheet size={18} />
            Export Excel
          </button>
        </div>
      </div>

      <div id="report-print-area" className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
        {/* Print Only Header */}
        <div className="hidden print:block print-header">
          <h1 className="uppercase">{state.systemInfo.companyName}</h1>
          <p className="text-lg font-bold">SALES SUMMARY REPORT</p>
          <p className="text-sm mt-1 text-slate-600">Generated: {new Date().toLocaleString()}</p>
          <p className="text-sm text-slate-500">
            Time Range: {timeRange.toUpperCase()} | 
            Filter: {filterType === 'all' ? 'No Filter' : `${filterType.toUpperCase()}: ${filterVal}`}
          </p>
        </div>

        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 space-y-4 no-print">
          {/* Time Filter Group */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Calendar size={14} /> Time Range
            </span>
            <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
              {(['today', 'month', 'year', 'all'] as TimeRange[]).map((range) => (
                <button 
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${timeRange === range ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  {range === 'all' ? 'All Time' : range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Search/Entity Filter Group */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
              <button 
                onClick={() => { setFilterType('all'); setFilterVal(''); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterType === 'all' ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                All Sales
              </button>
              <button 
                onClick={() => { setFilterType('pump'); setFilterVal(''); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterType === 'pump' ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                By Pump
              </button>
              <button 
                onClick={() => { setFilterType('customer'); setFilterVal(''); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterType === 'customer' ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                By Customer
              </button>
            </div>

            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder={filterType === 'pump' ? "Enter pump number (1-4)..." : "Filter results..."}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-colors"
                value={filterVal}
                onChange={(e) => setFilterVal(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700">
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4 text-center">Pump</th>
                <th className="px-6 py-4 text-right">Qty (L)</th>
                <th className="px-6 py-4 text-right">Amount (BHD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{sale.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{new Date(sale.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">{sale.customerName}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold text-xs">
                      {sale.pumpId}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-mono dark:text-slate-300">{sale.quantity.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-black text-slate-900 dark:text-white">{sale.totalAmount.toFixed(3)}</span>
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 italic">No transactions found for the selected filters.</td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-slate-900 dark:bg-slate-950 text-white font-bold">
              <tr>
                <td colSpan={4} className="px-6 py-4 text-right">TOTALS</td>
                <td className="px-6 py-4 text-right font-mono">
                  {filteredSales.reduce((acc, s) => acc + s.quantity, 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right">
                  {filteredSales.reduce((acc, s) => acc + s.totalAmount, 0).toFixed(3)} BHD
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      {/* Print Footer Only visible on paper */}
      <div className="hidden print:block text-[9pt] text-slate-400 text-center mt-10">
        <p>{state.systemInfo.companyName} Premium W.L.L • Digital Signature Verification Enabled</p>
        <p>This is a computer-generated report and does not require a physical signature.</p>
      </div>
    </div>
  );
};

export default Reports;
