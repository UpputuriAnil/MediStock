import React, { useState } from 'react';
import { Drawer } from '../common/Drawer';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Medicine } from '../../types/inventory';
import { useInventory } from '../../context/InventoryContext';
import { formatCurrency, getExpiryStatus } from '../../utils/formatters';
import { Plus, Minus, Calendar, MapPin, Layers, Truck, ShieldAlert, FileText } from 'lucide-react';

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
  const { adjustStock } = useInventory();
  const [adjustAmount, setAdjustAmount] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState<string>('Routine stock replenishment');

  if (!medicine) return null;

  const expiryInfo = getExpiryStatus(medicine.expiryDate);

  const handleApplyAdjustment = (delta: number) => {
    adjustStock(medicine.id, delta, adjustReason);
  };

  return (
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
                <Layers className="w-3 h-3 text-primary-500" /> Therapeutic Category
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
              {formatCurrency(medicine.price)} / {medicine.unit}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Total Inventory Value</span>
            <span className="text-base font-extrabold text-primary-600">
              {formatCurrency(medicine.price * medicine.stock)}
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
      </div>
    </Drawer>
  );
};
