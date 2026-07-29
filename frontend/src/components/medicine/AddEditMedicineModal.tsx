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
    if (isEditing && medicineToEdit) {
      updateMedicine(medicineToEdit.id, data);
    } else {
      addMedicine(data);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Medicine: ${medicineToEdit?.name}` : 'Register New Medicine Item'}
      subtitle="Fill in clinical specification, batch details, and stock threshold levels"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs font-semibold">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Brand Name"
            placeholder="e.g. Amoxicillin Trihydrate"
            error={errors.name?.message}
            {...register('name', { required: 'Brand name is required' })}
          />
          <Input
            label="Generic Name"
            placeholder="e.g. Amoxicillin 500mg"
            error={errors.genericName?.message}
            {...register('genericName', { required: 'Generic name is required' })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Therapeutic Category
            </label>
            <select
              {...register('category')}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-primary-600"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Primary Supplier
            </label>
            <select
              {...register('supplier')}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-primary-600"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input
            label="Initial Stock"
            type="number"
            {...register('stock', { valueAsNumber: true, required: true })}
          />
          <Input
            label="Min Threshold"
            type="number"
            {...register('minStockThreshold', { valueAsNumber: true, required: true })}
          />
          <Input
            label="Unit Type"
            placeholder="Tab / Vial / Pen"
            {...register('unit', { required: true })}
          />
          <Input
            label="Unit Price ($)"
            type="number"
            step="0.01"
            {...register('price', { valueAsNumber: true, required: true })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Batch Number"
            placeholder="BT-99012"
            {...register('batchNumber', { required: true })}
          />
          <Input
            label="Manufacture Date"
            type="date"
            {...register('manufactureDate', { required: true })}
          />
          <Input
            label="Expiry Date"
            type="date"
            {...register('expiryDate', { required: true })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Storage Location"
            placeholder="Shelf A-12 / Room R-2"
            {...register('location', { required: true })}
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Stock Status
            </label>
            <select
              {...register('status')}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-primary-600"
            >
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Near Expiry">Near Expiry</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
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
