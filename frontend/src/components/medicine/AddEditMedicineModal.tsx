import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Medicine } from '../../types/inventory';
import { useInventory } from '../../context/InventoryContext';

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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Omit<Medicine, 'id'>>();

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
        category: categories[0]?.name || 'Antibiotics & Antimicrobials',
        supplier: suppliers[0]?.name || 'BioPharma Global Inc.',
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
      supplier: data.supplier || (suppliers[0]?.name || 'BioPharma Global Inc.'),
      minStockThreshold: data.minStockThreshold || 15,
      unit: data.unit || 'Tabs',
      manufactureDate: data.manufactureDate || '2025-01-01',
      location: data.location || 'Shelf A-01',
      status: data.stock <= 0 ? 'Out of Stock' : (data.stock <= (data.minStockThreshold || 15) ? 'Low Stock' : 'In Stock'),
    };

    if (isEditing && medicineToEdit) {
      updateMedicine(medicineToEdit.id, sanitizedData);
    } else {
      addMedicine(sanitizedData);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
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
            placeholder="500"
            {...register('stock', { valueAsNumber: true, required: true })}
          />
          <Input
            label="Price per Unit (₹)"
            type="number"
            step="0.01"
            placeholder="2.50"
            {...register('price', { valueAsNumber: true, required: true })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Batch Number"
            placeholder="BT-DOLO650-99"
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

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {isEditing ? 'Save Changes' : 'Create Medicine'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
