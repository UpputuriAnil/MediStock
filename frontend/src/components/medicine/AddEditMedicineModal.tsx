import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Medicine } from '../../types/inventory';
import { useInventory } from '../../context/InventoryContext';
import { RazorpayPaymentModal, PaymentDetails } from '../payment/RazorpayPaymentModal';
import { CreditCard, Sparkles, Lock } from 'lucide-react';

interface AddEditMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicineToEdit?: Medicine | null;
}

export const AddEditMedicineModal: React.FC<AddEditMedicineModalProps> = ({
  isOpen,
  onClose,
  medicineToEdit,
}) => {
  const { addMedicine, updateMedicine, categories, suppliers } = useInventory();
  const isEditing = !!medicineToEdit;

  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [pendingMedicineData, setPendingMedicineData] = useState<any>(null);
  const [razorpayPaymentDetails, setRazorpayPaymentDetails] = useState<PaymentDetails | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<Omit<Medicine, 'id'>>();

  const watchStock = watch('stock') || 100;
  const watchPrice = watch('price') || 1.0;
  const watchName = watch('name') || '';
  const watchSupplier = watch('supplier') || (suppliers[0]?.name || 'Apollo Pharmacy');

  const calculatedTotalRupees = Math.max(0, (watchStock || 0) * (watchPrice || 0));

  useEffect(() => {
    if (medicineToEdit) {
      reset({
        name: medicineToEdit.name,
        genericName: medicineToEdit.genericName,
        category: medicineToEdit.category,
        supplier: medicineToEdit.supplier,
        stock: medicineToEdit.stock,
        minStockThreshold: medicineToEdit.minStockThreshold,
        unit: medicineToEdit.unit,
        price: medicineToEdit.price,
        batchNumber: medicineToEdit.batchNumber,
        expiryDate: medicineToEdit.expiryDate,
        manufactureDate: medicineToEdit.manufactureDate,
        location: medicineToEdit.location,
        status: medicineToEdit.status,
        description: medicineToEdit.description || '',
      });
    } else {
      reset({
        name: '',
        genericName: '',
        category: categories[0]?.name || 'Analgesic / Antipyretic',
        supplier: suppliers[0]?.name || 'Apollo Pharmacy (Retail & Institutional Supply)',
        stock: 100,
        minStockThreshold: 20,
        unit: 'Tab',
        price: 1.0,
        batchNumber: `BT-${Math.floor(10000 + Math.random() * 90000)}`,
        manufactureDate: '2025-01-01',
        expiryDate: '2027-12-31',
        location: 'Shelf A-01',
        status: 'In Stock',
        description: '',
      });
    }
  }, [medicineToEdit, isOpen, reset, categories, suppliers]);

  const onSubmit = (data: any) => {
    const sanitizedData = {
      ...data,
      genericName: data.genericName || data.name,
      supplier: data.supplier || (suppliers[0]?.name || 'Apollo Pharmacy'),
      minStockThreshold: data.minStockThreshold || 15,
      unit: data.unit || 'Tabs',
      manufactureDate: data.manufactureDate || '2025-01-01',
      location: data.location || 'Shelf A-01',
      status: data.stock <= 0 ? 'Out of Stock' : (data.stock <= (data.minStockThreshold || 15) ? 'Low Stock' : 'In Stock'),
    };

    if (isEditing && medicineToEdit) {
      updateMedicine(medicineToEdit.id, sanitizedData);
      onClose();
    } else {
      // Intercept Medicine Creation: Launch Razorpay Payment Process
      setPendingMedicineData(sanitizedData);
      setRazorpayPaymentDetails({
        medicineName: sanitizedData.name,
        stock: sanitizedData.stock,
        pricePerUnit: sanitizedData.price,
        totalAmount: sanitizedData.stock * sanitizedData.price,
        supplier: sanitizedData.supplier,
        category: sanitizedData.category,
        batchNumber: sanitizedData.batchNumber,
      });
      setIsRazorpayModalOpen(true);
    }
  };

  const handleRazorpaySuccess = (razorpayData: {
    paymentId: string;
    orderId: string;
    signature: string;
    method: string;
    amount: number;
    timestamp: string;
  }) => {
    if (pendingMedicineData) {
      const finalMedicine = {
        ...pendingMedicineData,
        razorpayPaymentId: razorpayData.paymentId,
        razorpayOrderId: razorpayData.orderId,
        paymentStatus: 'PAID' as const,
        paymentAmount: razorpayData.amount,
        paymentMethod: razorpayData.method,
        paymentDate: razorpayData.timestamp,
      };
      addMedicine(finalMedicine);
    }
    setIsRazorpayModalOpen(false);
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !isRazorpayModalOpen}
        onClose={onClose}
        title={isEditing ? `Edit Medicine: ${medicineToEdit?.name}` : 'Register New Medicine Item'}
        subtitle="Fill in essential medicine specifications, stock quantity, and expiry details"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Medicine Name & Dosage"
              placeholder="e.g. Paracetamol 650mg"
              error={errors.name?.message}
              {...register('name', { required: 'Medicine name is required' })}
            />
            <Input
              label="Brand Name"
              placeholder="e.g. Dolo 650 / Crocin"
              {...register('brandName')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Manufacturer / Pharma Brand"
              placeholder="e.g. Micro Labs / Sun Pharma"
              {...register('manufacturer')}
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Medicine Category
              </label>
              <select
                {...register('category')}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-3.5 pr-8 py-2.5 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-primary-600 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-1">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Stock Quantity"
              type="number"
              placeholder="100"
              {...register('stock', { valueAsNumber: true, required: true })}
            />
            <Input
              label="Price per Unit (₹)"
              type="number"
              step="0.01"
              placeholder="1.00"
              {...register('price', { valueAsNumber: true, required: true })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Batch Number"
              placeholder="BT-29112"
              {...register('batchNumber', { required: true })}
            />
            <Input
              label="Expiry Date"
              type="date"
              {...register('expiryDate', { required: true })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Registered Supplier Vendor
            </label>
            <select
              {...register('supplier')}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-3.5 pr-8 py-2.5 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-primary-600 cursor-pointer"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.name} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-1">
                  {s.name} ({s.category || 'Supplier'})
                </option>
              ))}
            </select>
          </div>

          {/* Razorpay Payment Summary Callout (for new medicine creation) */}
          {!isEditing && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#0c2340]/90 to-[#183968]/90 border border-blue-500/30 text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-extrabold text-xs shadow-md">
                  R
                </div>
                <div>
                  <span className="font-bold text-xs flex items-center gap-1 text-blue-200">
                    <Lock className="w-3 h-3 text-emerald-400" /> Razorpay Procurement Payment
                  </span>
                  <p className="text-[10px] text-blue-100/70">
                    {watchStock} units @ ₹{watchPrice}/unit
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-blue-200 block uppercase font-medium">Total Amount</span>
                <span className="text-sm font-extrabold text-emerald-400 font-mono">
                  ₹{calculatedTotalRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className={!isEditing ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20' : ''}
              leftIcon={!isEditing ? <CreditCard className="w-4 h-4" /> : undefined}
            >
              {isEditing ? 'Save Changes' : `Proceed to Razorpay Payment (₹${calculatedTotalRupees.toLocaleString('en-IN')})`}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Razorpay Payment Modal */}
      {razorpayPaymentDetails && (
        <RazorpayPaymentModal
          isOpen={isRazorpayModalOpen}
          onClose={() => setIsRazorpayModalOpen(false)}
          paymentDetails={razorpayPaymentDetails}
          onPaymentSuccess={handleRazorpaySuccess}
        />
      )}
    </>
  );
};
