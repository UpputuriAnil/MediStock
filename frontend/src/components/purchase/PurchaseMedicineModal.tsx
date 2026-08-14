import React, { useState, useEffect } from 'react';
import { ShoppingBag, Calculator, UserCheck, Calendar, DollarSign, Package, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface PurchaseMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PurchaseMedicineModal: React.FC<PurchaseMedicineModalProps> = ({ isOpen, onClose }) => {
  const { medicines, suppliers, addOrder, addMedicine, updateMedicine, adjustStock } = useInventory();
  const { user } = useAuth();

  // Load Pharmacists
  const pharmacists = React.useMemo(() => {
    try {
      const raw = localStorage.getItem('medistock_users_list');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed.filter((u: any) => {
            const r = (u.role || '').toLowerCase();
            return r.includes('pharmacist') || r.includes('chief') || r.includes('staff');
          });
          if (filtered.length > 0) return filtered;
        }
      }
    } catch (e) {}
    return [
      { id: 'usr_001', name: 'Dr. Sarah Jenkins', email: 'sarah.jenkins@medistock.health', role: 'Chief Pharmacist' },
      { id: 'usr_004', name: 'David Chen', email: 'david.chen@medistock.health', role: 'Staff Pharmacist' },
      { id: 'usr_005', name: 'Amara Okafor', email: 'amara.okafor@medistock.health', role: 'Staff Pharmacist' },
    ];
  }, []);

  // Form State
  const [isNewMedicine, setIsNewMedicine] = useState(false);
  const [selectedMedicineId, setSelectedMedicineId] = useState(medicines[0]?.id || '');
  const [customMedicineName, setCustomMedicineName] = useState('');
  const [category, setCategory] = useState('General Pharmaceuticals');
  const [selectedPharmacistEmail, setSelectedPharmacistEmail] = useState(pharmacists[0]?.email || '');
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(100);
  const [pricePerUnit, setPricePerUnit] = useState<number>(5.0);
  const [batchNumber, setBatchNumber] = useState(`BAT-${Math.floor(1000 + Math.random() * 9000)}`);
  
  // Future expiry date default (1 year from now)
  const defaultFutureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [expiryDate, setExpiryDate] = useState(defaultFutureDate);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Math.floor(10000 + Math.random() * 90000)}`);
  const [notes, setNotes] = useState('');

  // Auto-calculated Total Price
  const totalPrice = Math.max(0, (quantity || 0) * (pricePerUnit || 0));

  // Sync selected medicine defaults
  useEffect(() => {
    if (!isNewMedicine && selectedMedicineId) {
      const med = medicines.find((m) => m.id === selectedMedicineId);
      if (med) {
        setPricePerUnit(med.price || 5.0);
        if (med.category) setCategory(med.category);
      }
    }
  }, [selectedMedicineId, isNewMedicine, medicines]);

  const handleSubmitPurchase = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation Logic
    if (quantity <= 0) {
      toast.error('Quantity must be greater than zero');
      return;
    }
    if (pricePerUnit <= 0) {
      toast.error('Price per unit must be greater than zero');
      return;
    }
    if (new Date(expiryDate).getTime() <= new Date().getTime()) {
      toast.error('Expiry date must be in the future (no expired medicines)');
      return;
    }

    const supplier = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];
    const pharmacist = pharmacists.find((p: any) => p.email === selectedPharmacistEmail) || pharmacists[0];

    let medName = customMedicineName.trim();
    let targetMedId = selectedMedicineId;

    if (!isNewMedicine) {
      const existing = medicines.find((m) => m.id === selectedMedicineId);
      if (existing) medName = existing.name;
    } else {
      if (!medName) {
        toast.error('Please enter a medicine name');
        return;
      }
    }

    // 2. Resolve/Register Medicine in Catalog (Stock added upon Supplier Delivery)
    if (isNewMedicine) {
      const newMedId = `med_${Date.now()}`;
      targetMedId = newMedId;
      addMedicine({
        name: medName,
        genericName: medName,
        category,
        supplier: supplier?.name || 'BioPharma Inc.',
        stock: 0,
        minStockThreshold: 20,
        unit: 'tablets',
        price: pricePerUnit,
        batchNumber,
        expiryDate,
        manufactureDate: purchaseDate,
        location: 'Central Pharmacy Shelf',
        status: 'Low Stock',
      });
    }

    // 3. Create Purchase Transaction Record with status 'Pending'
    const orderNumber = `PO-${Math.floor(8800 + Math.random() * 1000)}`;
    addOrder({
      supplierId: supplier?.id || 'SUP-01',
      supplierName: supplier?.name || 'BioPharma Global Inc.',
      medicineId: targetMedId,
      medicineName: medName,
      quantity,
      pricePerUnit,
      itemsCount: quantity,
      totalAmount: totalPrice,
      assignedPharmacistId: pharmacist?.id || 'usr_001',
      assignedPharmacistName: pharmacist?.name || 'Dr. Sarah Jenkins',
      assignedPharmacistEmail: pharmacist?.email || 'sarah.jenkins@medistock.health',
      batchNumber,
      expiryDate,
      invoiceNumber,
      notes,
      status: 'Pending',
      expectedDelivery: purchaseDate,
      createdByName: user?.name || 'Admin User',
      items: [
        {
          medicineName: medName,
          quantity,
          unitPrice: pricePerUnit,
        },
      ],
    });

    toast.success(
      `Purchase Order ${orderNumber} generated with status 'Pending'! Stock will be added when supplier delivers the order.`
    );

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Admin → Purchase Medicine & Assign Stock"
      subtitle="Purchase new or existing pharmaceutical stock, calculate total cost, and assign to a pharmacist"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmitPurchase} className="space-y-4 text-xs font-semibold">
        {/* Toggle Existing vs New Medicine */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-slate-700 dark:text-slate-200 font-bold">Select Medicine Type:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsNewMedicine(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                !isNewMedicine ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Select Existing Medicine
            </button>
            <button
              type="button"
              onClick={() => setIsNewMedicine(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isNewMedicine ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              + Add Brand New Medicine
            </button>
          </div>
        </div>

        {/* Medicine Name Selection */}
        {!isNewMedicine ? (
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Medicine Name
            </label>
            <select
              value={selectedMedicineId}
              onChange={(e) => setSelectedMedicineId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 outline-none text-slate-800 dark:text-slate-100 focus:border-primary-600 font-semibold cursor-pointer"
            >
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.brandName ? `(${m.brandName})` : ''} — Mfr: {m.manufacturer || 'General Pharma'} | Supplier: {m.supplier} — Stock: {m.stock} {m.unit}s
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Medicine Name & Dosage"
              placeholder="e.g. Paracetamol 650mg"
              value={customMedicineName}
              onChange={(e) => setCustomMedicineName(e.target.value)}
              required
            />
            <Input
              label="Pharmaceutical Category"
              placeholder="e.g. Analgesic / Antipyretic"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
        )}

        {/* Pharmacist & Supplier Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-primary-500" /> Assign To Pharmacist
            </label>
            <select
              value={selectedPharmacistEmail}
              onChange={(e) => setSelectedPharmacistEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 outline-none text-slate-800 dark:text-slate-100 focus:border-primary-600 font-semibold cursor-pointer"
            >
              {pharmacists.map((p: any) => (
                <option key={p.email} value={p.email}>
                  {p.name} ({p.role || 'Pharmacist'}) — {p.email}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Registered Supplier Vendor
            </label>
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 outline-none text-slate-800 dark:text-slate-100 focus:border-primary-600 font-semibold cursor-pointer"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category || 'Supplier'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quantity, Unit Price, and Auto-Calculated Total Price */}
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Purchased Quantity (Units)"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
            required
          />
          <Input
            label="Price Per Unit ($)"
            type="number"
            step="0.01"
            min="0.01"
            value={pricePerUnit}
            onChange={(e) => setPricePerUnit(Math.max(0.01, parseFloat(e.target.value) || 0))}
            required
          />

          {/* Auto-Calculated Total Price Box */}
          <div className="space-y-1.5">
            <label className="block text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5 text-emerald-400" /> Total Price (Auto)
            </label>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-400 font-mono font-black text-sm flex items-center justify-between">
              <span>Total:</span>
              <span>${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Batch Number, Expiry Date, Purchase Date, Invoice */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Batch Number"
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
            required
          />
          <Input
            label="Expiry Date (Must be Future Date)"
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Purchase Date"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
          />
          <Input
            label="Optional Invoice Number"
            placeholder="e.g. INV-99412"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
          />
        </div>

        {/* Notes / Remarks */}
        <div className="space-y-1.5">
          <label className="block text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Notes / Remarks (Optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional procurement comments or storage instructions..."
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 outline-none text-slate-800 dark:text-slate-100 text-xs font-medium"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" leftIcon={<ShoppingBag className="w-4 h-4" />}>
            Purchase Medicine & Assign Stock
          </Button>
        </div>
      </form>
    </Modal>
  );
};
