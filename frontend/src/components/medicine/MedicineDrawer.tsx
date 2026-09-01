import React, { useState } from 'react';
import { Drawer } from '../common/Drawer';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Medicine } from '../../types/inventory';
import { useInventory } from '../../context/InventoryContext';
import { formatCurrency, getExpiryStatus } from '../../utils/formatters';
import { PaymentReceiptModal } from '../payment/PaymentReceiptModal';
import { Plus, Minus, Calendar, MapPin, Layers, Truck, ShieldAlert, FileText, Trash2, CreditCard, Receipt } from 'lucide-react';

interface MedicineDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null;
}

export const MedicineDrawer: React.FC<MedicineDrawerProps> = ({
  isOpen,
  onClose,
  medicine,
}) => {
  const { adjustStock, deleteMedicine } = useInventory();
  const [adjustAmount, setAdjustAmount] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState<string>('Routine stock replenishment');
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  if (!medicine) return null;

  const expiryInfo = getExpiryStatus(medicine.expiryDate);

  const handleApplyAdjustment = (delta: number) => {
    adjustStock(medicine.id, delta, adjustReason);
  };

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title={medicine.name}
        subtitle={`Product ID: ${medicine.id} • ${medicine.genericName}`}
        width="lg"
      >
        <div className="space-y-6 text-xs font-semibold">
          {/* Top Hero Image Card */}
          <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-soft">
            <img
              src={medicine.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500'}
              alt={medicine.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
              <div className="text-white">
                <Badge variant="primary" dot>{medicine.status}</Badge>
                <h3 className="text-xl font-bold mt-1">{medicine.name}</h3>
              </div>
            </div>
          </div>

          {/* Razorpay Payment Information Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border border-blue-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center font-extrabold text-[10px] text-white">
                  R
                </div>
                <span className="font-bold text-xs text-white">Razorpay Payment Metadata</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                {medicine.paymentStatus || 'PAID'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
              <div>
                <span className="text-[10px] text-slate-400 font-sans block">Payment Txn ID:</span>
                <span className="text-blue-400 font-bold">{medicine.razorpayPaymentId || 'pay_procured_online'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-sans block">Payment Method:</span>
                <span className="text-slate-200">{medicine.paymentMethod || 'Razorpay Gateway'}</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReceiptOpen(true)}
              className="w-full mt-1 border-blue-500/40 hover:bg-blue-500/10 text-blue-400 font-bold flex items-center justify-center gap-2"
              leftIcon={<Receipt className="w-3.5 h-3.5" />}
            >
              View Razorpay Tax Receipt & Invoice
            </Button>
          </div>

          {/* Quick Stock Adjustment Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Quick Stock Adjustment
            </h4>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] text-slate-400">Current Stock</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {medicine.stock} <span className="text-xs font-medium text-slate-400">{medicine.unit}s</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleApplyAdjustment(-adjustAmount)}
                  leftIcon={<Minus className="w-3.5 h-3.5" />}
                >
                  Stock Out (-{adjustAmount})
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleApplyAdjustment(adjustAmount)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Stock In (+{adjustAmount})
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <input
                type="number"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(Number(e.target.value))}
                placeholder="Qty"
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none"
              />
              <input
                type="text"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="Reason for adjustment"
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none"
              />
            </div>
          </div>

          {/* Detailed Metadata Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Clinical Specifications
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
                  <Layers className="w-3 h-3 text-primary-500" /> Medicine Category
                </span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{medicine.category}</p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
                  <Truck className="w-3 h-3 text-secondary-500" /> Supplier
                </span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{medicine.supplier}</p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
                  <Calendar className="w-3 h-3 text-warning-500" /> Expiry Status
                </span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{medicine.expiryDate}</p>
                <p className="text-[10px] text-warning-600 mt-0.5">{expiryInfo.label}</p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
                  <MapPin className="w-3 h-3 text-emerald-500" /> Storage Location
                </span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{medicine.location}</p>
              </div>
            </div>
          </div>

          {/* Pricing & Batch Info */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Unit Price</span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                ₹{medicine.price?.toFixed(2)} / {medicine.unit}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Total Inventory Value</span>
              <span className="text-base font-extrabold text-primary-600 font-mono">
                ₹{(medicine.price * medicine.stock).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Batch Identifier</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                {medicine.batchNumber}
              </span>
            </div>
          </div>

          {/* Description / Indications */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Clinical Indications & Notes
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              {medicine.description || 'No detailed clinical notes attached.'}
            </p>
          </div>

          {/* Delete Medicine Action Button */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="danger"
              size="md"
              className="w-full flex items-center justify-center gap-2 font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20"
              onClick={() => {
                deleteMedicine(medicine.id);
                onClose();
              }}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Delete Medicine Item
            </Button>
          </div>
        </div>
      </Drawer>

      {/* Payment Receipt Modal */}
      <PaymentReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        medicine={medicine}
      />
    </>
  );
};
