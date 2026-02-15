
import React, { useState, useEffect } from 'react';
import { AppState, SaleType, Customer, Pump, Sale, PaymentMethod } from '../types';
import { Search, Droplet, User, Calculator, Receipt, Printer, X, Truck, Tag, CreditCard, DollarSign } from 'lucide-react';

interface POSProps {
  state: AppState;
  onAddSale: (sale: Sale) => void;
  updatePumpReading: (pumpId: number, newReading: number) => void;
}

const POS: React.FC<POSProps> = ({ state, onAddSale, updatePumpReading }) => {
  const [selectedPump, setSelectedPump] = useState<Pump | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedSaleType, setSelectedSaleType] = useState<SaleType>(SaleType.GENERAL);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [gallonsDistributed, setGallonsDistributed] = useState<string>('');
  const [endReading, setEndReading] = useState<string>('');
  const [vehicleNo, setVehicleNo] = useState<string>('');
  const [driverName, setDriverName] = useState<string>('000');
  const [deliveryStatus, setDeliveryStatus] = useState<'COLLECTED' | 'DELIVERED'>('COLLECTED');
  const [showReceipt, setShowReceipt] = useState<Sale | null>(null);
  const [searchCustomer, setSearchCustomer] = useState('');

  useEffect(() => {
    if (selectedCustomer) {
      setVehicleNo(selectedCustomer.vehicleNo || '');
      if (selectedCustomer.defaultTier) {
        setSelectedSaleType(selectedCustomer.defaultTier);
      }
    } else {
      setVehicleNo('');
      setSelectedSaleType(SaleType.GENERAL);
    }
  }, [selectedCustomer]);

  useEffect(() => {
    if (selectedPump && gallonsDistributed) {
      const qty = parseFloat(gallonsDistributed);
      if (!isNaN(qty)) {
        setEndReading((selectedPump.currentReading + qty).toFixed(2));
      }
    }
  }, [gallonsDistributed, selectedPump]);

  const handleEndReadingChange = (val: string) => {
    setEndReading(val);
    if (selectedPump) {
      const end = parseFloat(val);
      if (!isNaN(end) && end >= selectedPump.currentReading) {
        setGallonsDistributed((end - selectedPump.currentReading).toFixed(2));
      }
    }
  };

  const filteredCustomers = state.customers.filter(c => 
    c.name.toLowerCase().includes(searchCustomer.toLowerCase()) || 
    c.phone.includes(searchCustomer)
  );

  const getCurrentRate = () => {
    if (!selectedCustomer) return 0;
    switch (selectedSaleType) {
      case SaleType.GENERAL: return selectedCustomer.pricing.general;
      case SaleType.SMALL: return selectedCustomer.pricing.small;
      case SaleType.LARGE: return selectedCustomer.pricing.large;
      default: return 0;
    }
  };

  const calculateTotal = () => {
    if (!selectedCustomer || !gallonsDistributed) return null;
    const quantity = parseFloat(gallonsDistributed);
    if (isNaN(quantity) || quantity <= 0) return null;
    const rate = getCurrentRate();
    const total = quantity * rate;
    return { quantity, rate, total };
  };

  const totals = calculateTotal();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPump || !selectedCustomer || !totals) return;
    if (paymentMethod === 'CREDIT' && !selectedCustomer.isCredit) {
      alert("This customer is not authorized for credit sales.");
      return;
    }

    const newSale: Sale = {
      id: `INV${Math.floor(100000 + Math.random() * 900000)}`,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      pumpId: selectedPump.id,
      startReading: selectedPump.currentReading,
      endReading: parseFloat(endReading) || selectedPump.currentReading + totals.quantity,
      quantity: totals.quantity,
      rate: totals.rate,
      saleType: selectedSaleType,
      paymentMethod: paymentMethod,
      totalAmount: totals.total,
      currency: 'BHD',
      timestamp: Date.now(),
      vehicleNo: vehicleNo || '000',
      driverName: driverName || '000',
      deliveryStatus: deliveryStatus,
    };

    onAddSale(newSale);
    updatePumpReading(selectedPump.id, newSale.endReading);
    setShowReceipt(newSale);
    setGallonsDistributed('');
    setEndReading('');
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
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
          .thermal-header-box {
            border: 2px solid black;
            padding: 2mm;
            margin-bottom: 2mm;
            text-align: center;
          }
        }
      `}</style>

      <div className="no-print flex justify-between items-center">
        <div><h2 className="text-3xl font-bold text-slate-900 dark:text-white">New Transaction</h2><p className="text-slate-500 dark:text-slate-400">Record a sale by volume (Gallons/Units).</p></div>
        {selectedCustomer && selectedCustomer.isCredit && (
          <div className="bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-xl border border-amber-200 flex items-center gap-3">
            <CreditCard size={18} className="text-amber-600" />
            <div><p className="text-[10px] font-black text-amber-500 uppercase leading-none">Credit Balance</p><p className="text-sm font-black text-amber-900 dark:text-amber-400 font-mono">{selectedCustomer.balance.toFixed(3)} BHD</p></div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 no-print">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Droplet size={16} className="text-blue-500" />1. Select Pump</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {state.pumps.map(pump => (
                <button key={pump.id} type="button" onClick={() => setSelectedPump(pump)} className={`p-5 rounded-2xl border-2 transition-all ${selectedPump?.id === pump.id ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-700'}`}>
                  <p className="text-[10px] font-black uppercase mb-1">PUMP</p><p className="text-3xl font-black">{pump.id}</p><p className="text-[9px] font-mono opacity-60">Meter: {pump.currentReading.toFixed(2)}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><User size={16} className="text-violet-500" />2. Select Customer</h3>
            <div className="relative mb-6"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Search name or phone..." value={searchCustomer} onChange={(e) => setSearchCustomer(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 dark:bg-slate-900 dark:text-white transition-all outline-none font-medium" /></div>
            <div className="max-h-[200px] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3 pr-2 custom-scrollbar">
              {filteredCustomers.map(customer => (
                <button key={customer.id} type="button" onClick={() => setSelectedCustomer(customer)} className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all text-left ${selectedCustomer?.id === customer.id ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/40 shadow-md' : 'border-transparent bg-slate-50/50 dark:bg-slate-900/50'}`}>
                  <div className="flex-1"><p className="font-black text-slate-900 dark:text-white">{customer.name}</p><p className="text-[10px] text-slate-500 font-bold">{customer.phone}</p></div>
                </button>
              ))}
            </div>
          </section>

          {selectedCustomer && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in-95">
              <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Tag size={16} className="text-indigo-500" />3. Category</h3>
                <div className="flex flex-col gap-2">
                  {[SaleType.GENERAL, SaleType.SMALL, SaleType.LARGE].map(tier => (
                    <button key={tier} type="button" onClick={() => setSelectedSaleType(tier)} className={`p-4 rounded-xl border-2 flex justify-between items-center transition-all ${selectedSaleType === tier ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-50 dark:border-slate-700'}`}>
                      <span className="font-black text-[11px] uppercase tracking-wider">{tier}</span>
                      <span className="font-black font-mono">{selectedCustomer.pricing[tier.toLowerCase() as keyof typeof selectedCustomer.pricing].toFixed(3)} BHD</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><DollarSign size={16} className="text-emerald-500" />4. Payment</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setPaymentMethod('CASH')} className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'CASH' ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-50 dark:border-slate-700'}`}><DollarSign size={24} /><span className="font-black text-[10px] uppercase">Cash</span></button>
                  <button type="button" disabled={!selectedCustomer.isCredit} onClick={() => setPaymentMethod('CREDIT')} className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'CREDIT' ? 'border-amber-600 bg-amber-50 dark:bg-amber-900/20' : !selectedCustomer.isCredit ? 'opacity-30 grayscale cursor-not-allowed' : 'border-slate-50 dark:border-slate-700'}`}><CreditCard size={24} /><span className="font-black text-[10px] uppercase">Credit</span></button>
                </div>
              </section>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl space-y-8 transition-colors sticky top-8">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3"><Calculator size={24} className="text-blue-500" />Order Tally</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Gallons Distributed (Primary)</label>
                <input type="number" step="0.01" required placeholder="0.00" value={gallonsDistributed} onChange={(e) => setGallonsDistributed(e.target.value)} className="w-full p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-400 font-mono text-3xl font-black outline-none focus:ring-4 ring-blue-100" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Beginning Meter Reading (Start)</label>
                <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl text-slate-500 font-mono text-lg font-bold">{selectedPump ? selectedPump.currentReading.toFixed(2) : '0.00'}</div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">End Meter Reading (Proof)</label>
                <input type="number" step="0.01" value={endReading} onChange={(e) => handleEndReadingChange(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-mono text-lg font-bold outline-none" placeholder="Auto-calculated" />
              </div>
              <div className="pt-8 border-t-2 border-dashed border-slate-100 space-y-3">
                <div className="flex justify-between items-end border-t pt-4">
                  <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Payable</p><p className="text-4xl font-black font-mono tracking-tighter text-blue-600 dark:text-blue-400">{totals?.total?.toFixed(3) || '0.000'} <span className="text-lg">BHD</span></p></div>
                  <span className="text-sm font-black text-slate-400 uppercase">{paymentMethod}</span>
                </div>
              </div>
              <button type="submit" disabled={!totals} className={`w-full text-white font-black py-6 rounded-2xl shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-3 ${paymentMethod === 'CREDIT' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700'}`}><Receipt size={24} />POST TRANSACTION</button>
            </div>
          </form>
        </div>
      </div>

      {showReceipt && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-[400px] rounded-3xl shadow-2xl relative overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700 no-print">
              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Receipt Generated</h3>
              <button onClick={() => setShowReceipt(null)} className="p-2 text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex justify-center bg-slate-100 dark:bg-slate-900">
              <div id="printable-receipt" className="print-area bg-white text-black p-4 w-[80mm] shadow-lg">
                <div className="thermal-header-box">
                  <h1 className="thermal-bold thermal-large uppercase">{state.systemInfo.companyName}</h1>
                  <p className="thermal-small">{state.systemInfo.tagline}</p>
                </div>

                <div className="thermal-center">
                   <p className="thermal-small">{state.systemInfo.address}</p>
                </div>

                <div className="thermal-divider"></div>

                <div className="thermal-small leading-loose">
                  <div className="flex justify-between"><span>INVOICE NO:</span><span className="thermal-bold">{showReceipt.id}</span></div>
                  <div className="flex justify-between"><span>DATE/TIME:</span><span>{new Date(showReceipt.timestamp).toLocaleString([], {hour: '2-digit', minute:'2-digit', day:'2-digit', month:'2-digit', year:'numeric'})}</span></div>
                  <div className="flex justify-between"><span>PAYMENT:</span><span className="thermal-bold uppercase">{showReceipt.paymentMethod}</span></div>
                </div>

                <div className="thermal-divider"></div>

                <div className="thermal-small leading-tight mb-2">
                  <div className="flex flex-col mb-1"><span className="thermal-bold">CUSTOMER:</span><span>{showReceipt.customerName}</span></div>
                  <div className="flex justify-between"><span>VEHICLE:</span><span>{showReceipt.vehicleNo}</span></div>
                  <div className="flex justify-between"><span>CONTACT:</span><span>{showReceipt.customerPhone}</span></div>
                </div>

                <div className="thermal-divider"></div>

                <div className="thermal-small thermal-bold mb-1">
                  <div className="grid grid-cols-4">
                    <span className="col-span-2">PRODUCT</span>
                    <span className="thermal-right">QTY</span>
                    <span className="thermal-right">TOTAL</span>
                  </div>
                </div>
                
                <div className="thermal-small leading-tight mb-2">
                  <div className="grid grid-cols-4 mb-1">
                    <span className="col-span-2">WATER ({showReceipt.saleType})</span>
                    <span className="thermal-right">{showReceipt.quantity.toFixed(2)}</span>
                    <span className="thermal-right">{showReceipt.totalAmount.toFixed(3)}</span>
                  </div>
                  <div className="thermal-small opacity-80 pl-2">
                    Unit Rate: {showReceipt.rate.toFixed(3)} BHD
                  </div>
                </div>

                <div className="thermal-divider"></div>

                <div className="thermal-small leading-tight space-y-1">
                  <p className="thermal-bold uppercase mb-1">Meter Readings:</p>
                  <div className="flex justify-between italic"><span>METER START (G):</span><span>{showReceipt.startReading.toFixed(2)}</span></div>
                  <div className="flex justify-between italic"><span>METER END (G):</span><span>{showReceipt.endReading.toFixed(2)}</span></div>
                  <div className="flex justify-between thermal-bold"><span>NET VOLUME:</span><span>{showReceipt.quantity.toFixed(2)} G</span></div>
                  <div className="flex justify-between"><span>PUMP ID:</span><span>#0{showReceipt.pumpId}</span></div>
                </div>

                <div className="thermal-divider"></div>

                <div className="flex justify-between items-end mb-4">
                  <span className="thermal-bold thermal-large uppercase">GRAND TOTAL:</span>
                  <div className="thermal-right">
                    <p className="thermal-bold thermal-large">{showReceipt.totalAmount.toFixed(3)} BHD</p>
                  </div>
                </div>

                <div className="thermal-divider"></div>

                <div className="thermal-center mt-6">
                  <p className="thermal-small italic">Safe & Clean Water for Bahrain</p>
                  <p className="thermal-bold thermal-small mt-2 uppercase">*** THANK YOU ***</p>
                </div>
                
                <div className="mt-8 thermal-center">
                   <div className="border-t border-black w-1/2 mx-auto pt-1">
                      <p className="thermal-small uppercase">Signature</p>
                   </div>
                </div>
                
                <div className="h-12"></div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800 flex gap-4 no-print border-t border-slate-100 dark:border-slate-700">
              <button onClick={() => window.print()} className="flex-1 bg-slate-900 dark:bg-blue-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-black dark:hover:bg-blue-700 active:scale-95"><Printer size={24} />PRINT</button>
              <button onClick={() => setShowReceipt(null)} className="flex-1 bg-white dark:bg-slate-700 border-2 dark:border-slate-600 text-slate-900 dark:text-white font-black py-5 rounded-2xl">DONE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
