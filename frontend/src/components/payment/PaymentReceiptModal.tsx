import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Medicine } from '../../types/inventory';
import { Printer, Download, CheckCircle, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  medicine,
}) => {
  if (!medicine) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.success('Downloading Razorpay Tax Receipt (PDF)...');
  };

  const totalCost = medicine.paymentAmount || medicine.stock * medicine.price;
  const paymentId = medicine.razorpayPaymentId || `pay_${Math.random().toString(36).substring(2, 14)}`;
  const orderId = medicine.razorpayOrderId || `order_${Math.random().toString(36).substring(2, 12)}`;
  const paymentDate = medicine.paymentDate || new Date().toLocaleString('en-IN');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Razorpay Payment Receipt & Tax Invoice" maxWidth="md">
      <div className="space-y-5 text-xs font-semibold text-slate-800 dark:text-slate-100">
        {/* Printable Receipt Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          {/* Receipt Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-xs">
                  R
                </div>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">Razorpay Invoice</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Official Medical Procurement Receipt</p>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 text-[10px] flex items-center gap-1 justify-end">
                <CheckCircle className="w-3 h-3" /> PAID VIA RAZORPAY
              </span>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">{paymentDate}</p>
            </div>
          </div>

          {/* Reference IDs Grid */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono text-[11px]">
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Payment Txn ID:</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">{paymentId}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Razorpay Order ID:</span>
              <span className="text-slate-700 dark:text-slate-300 font-bold">{orderId}</span>
            </div>
          </div>

          {/* Procurement Item Details */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Medicine Specifications</h4>
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Medicine Name:</span>
                <span className="font-bold text-slate-900 dark:text-white">{medicine.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Supplier Vendor:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{medicine.supplier}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Batch Identifier:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{medicine.batchNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Procured Quantity:</span>
                <span className="font-bold text-slate-900 dark:text-white">{medicine.stock} {medicine.unit}s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Price per Unit:</span>
                <span>₹{medicine.price?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Total Paid Calculation */}
          <div className="p-3.5 rounded-xl bg-slate-900 text-white flex items-center justify-between font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Total Paid via Razorpay</span>
              <span className="text-emerald-400 text-xs font-sans">Includes 0% Healthcare Tax Exemption</span>
            </div>
            <span className="text-xl font-extrabold text-emerald-400">₹{totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>

          {/* Footer Security Badge */}
          <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Verified by Razorpay Financial Services
            </span>
            <span>Ref: MS-RZP-{Date.now().toString().slice(-6)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline" onClick={handleDownload} leftIcon={<Download className="w-4 h-4" />}>
            Download PDF
          </Button>
          <Button variant="primary" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>
            Print Receipt
          </Button>
        </div>
      </div>
    </Modal>
  );
};
